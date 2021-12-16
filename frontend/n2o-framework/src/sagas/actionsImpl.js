import {
    call,
    fork,
    put,
    select,
    takeEvery,
    throttle,
} from 'redux-saga/effects'
import { getFormValues } from 'redux-form'
import isFunction from 'lodash/isFunction'
import get from 'lodash/get'
import has from 'lodash/has'
import keys from 'lodash/keys'
import isEqual from 'lodash/isEqual'
import merge from 'deepmerge'
import values from 'lodash/values'
import map from 'lodash/map'
import assign from 'lodash/assign'
import isEmpty from 'lodash/isEmpty'
import some from 'lodash/some'

import { START_INVOKE } from '../constants/actionImpls'
import {
    makeFormModelPrefixSelector,
    makeModelIdSelector,
    makeWidgetValidationSelector,
} from '../ducks/widgets/selectors'
import { getModelSelector, selectionTypeSelector } from '../ducks/models/selectors'
import { validateField } from '../core/validation/createValidator'
import { actionResolver } from '../core/factory/actionResolver'
import { dataProviderResolver } from '../core/dataProviderResolver'
import { FETCH_INVOKE_DATA } from '../core/api'
import { setModel } from '../ducks/models/store'
import { disablePage, enablePage } from '../ducks/pages/store'
import { failInvoke, successInvoke } from '../actions/actionImpl'
import { disableWidgetOnFetch, enableWidget } from '../ducks/widgets/store'
import { changeButtonDisabled, callActionImpl } from '../ducks/toolbar/store'

import fetchSaga from './fetch'

/**
 * @deprecated
 */

export function* validate(options) {
    const isTouched = true
    const state = yield select()
    const validationConfig = yield select(
        makeWidgetValidationSelector(options.validatedWidgetId),
    )
    const values = (yield select(getFormValues(options.validatedWidgetId))) || {}

    return options.validate &&
    (yield call(
        validateField(
            validationConfig,
            options.validatedWidgetId,
            state,
            isTouched,
        ),
        values,
        options.dispatch,
    ))
}

/**
 * вызов экшена
 */
export function* handleAction(factories, action) {
    const { options, actionSrc } = action.payload

    try {
        let actionFunc

        if (isFunction(actionSrc)) {
            actionFunc = actionSrc
        } else {
            actionFunc = actionResolver(actionSrc, factories)
        }
        const state = yield select()
        const notValid = yield validate(options)

        if (notValid) {
            // eslint-disable-next-line no-console
            console.log(`Форма ${options.validatedWidgetId} не прошла валидацию.`)
        } else {
            yield actionFunc &&
        call(actionFunc, {
            ...options,
            state,
        })
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
    }
}

/**
 * Отправка запроса
 * @param dataProvider
 * @param model
 * @param apiProvider
 * @param action
 * @returns {IterableIterator<*>}
 */
export function* fetchInvoke(dataProvider, model, apiProvider, action) {
    const state = yield select()
    const selectionType = yield select(selectionTypeSelector)
    const { widgetId } = action.payload
    // TODO удалить селектор, когда бекенд начнёт присылать modelId для экшонов, которые присылает в конфиге
    const modelId = action.payload.modelId || (yield select(makeModelIdSelector(widgetId)))
    const multi = get(state, 'models.multi')
    const multiModel = multi?.[modelId] || []
    const widget = get(state, `widgets.${widgetId}`)
    const hasMultiModel = some(values(multi), model => !isEmpty(model))

    const needResolve = get(widget, 'modelPrefix') === 'resolve'

    const submitForm = get(dataProvider, 'submitForm', true)
    const {
        basePath: path,
        formParams,
        headersParams,
    } = yield dataProviderResolver(state, dataProvider)

    const isSelectionTypeCheckbox = selectionType[widgetId] === 'checkbox'

    const createModelRequest = () => {
        if (isSelectionTypeCheckbox && hasMultiModel) {
            const ids = multiModel.map(i => i.id)

            if (needResolve) {
                return { ...model, ids }
            }

            return map(multiModel, modelElement => ({ ...modelElement, ...formParams }))
        }
        const ids = get(model, 'ids')
        const requestIds = Array.isArray(ids) ? ids : [ids]

        return ids
            ? assign({}, model, { ids: requestIds }, formParams)
            : assign({}, model, formParams)
    }

    const modelRequest = createModelRequest()
    const formParamsRequest = isSelectionTypeCheckbox ? [formParams] : formParams

    return yield call(
        fetchSaga,
        FETCH_INVOKE_DATA,
        {
            basePath: path,
            baseQuery: {},
            baseMethod: dataProvider.method,
            headers: headersParams,
            model: submitForm ? modelRequest : formParamsRequest,
        },
        apiProvider,
        action,
        state,
    )
}

export function* handleFailInvoke(metaInvokeFail, widgetId, metaResponse) {
    const meta = merge(metaInvokeFail, metaResponse)

    yield put(failInvoke(widgetId, meta))
}

/**
 * вызов экшена
 */
// eslint-disable-next-line complexity
export function* handleInvoke(apiProvider, action) {
    const {
        modelLink,
        widgetId,
        pageId,
        dataProvider,
        data,
        needResolve = true,
    } = action.payload

    const state = yield select()
    const optimistic = get(dataProvider, 'optimistic', false)
    const buttonIds = !optimistic && has(state, 'toolbar') ? keys(state.toolbar[pageId]) : []

    try {
        if (!dataProvider) {
            throw new Error('dataProvider is undefined')
        }
        if (pageId && !optimistic) {
            yield put(disablePage(pageId))
        }
        if (widgetId && !optimistic) {
            yield put(disableWidgetOnFetch(widgetId))

            for (let index = 0; index <= buttonIds.length - 1; index += 1) {
                yield put(changeButtonDisabled(pageId, buttonIds[index], true))
            }
        }
        let model = data || {}

        if (modelLink) {
            model = yield select(getModelSelector(modelLink))
        }
        const response = optimistic
            ? yield fork(fetchInvoke, dataProvider, model, apiProvider, action)
            : yield call(fetchInvoke, dataProvider, model, apiProvider, action)

        const meta = merge(action.meta.success || {}, response.meta || {})
        const modelPrefix = yield select(makeFormModelPrefixSelector(widgetId))
        const { submitForm } = dataProvider
        const needRedirectOrCloseModal = meta.redirect || meta.modalsToClose

        if (
            (needResolve && (optimistic || !needRedirectOrCloseModal)) ||
            (!needRedirectOrCloseModal && !isEqual(model, response.data) && submitForm)
        ) {
            // TODO удалить селектор, когда бекенд начнёт присылать modelId для экшонов, которые присылает в конфиге
            const modelId = action.payload.modelId || (yield select(makeModelIdSelector(widgetId)))

            yield put(
                setModel(modelPrefix, modelId, optimistic ? model : response.data),
            )
        }
        yield put(successInvoke(widgetId, { ...meta }))
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        yield* handleFailInvoke(
            action.meta.fail || {},
            widgetId,
            err.json && err.json.meta ? err.json.meta : {},
        )
    } finally {
        if (pageId) {
            yield put(enablePage(pageId))
        }
        if (widgetId) {
            yield put(enableWidget(widgetId))

            for (let index = 0; index <= buttonIds.length - 1; index += 1) {
                yield put(changeButtonDisabled(pageId, buttonIds[index], false))
            }
        }
    }
}

// eslint-disable-next-line require-yield
export function* handleDummy() {
    // eslint-disable-next-line no-alert
    alert('AHOY!')
}

export default (apiProvider, factories) => [
    throttle(500, callActionImpl.type, handleAction, factories),
    throttle(500, START_INVOKE, handleInvoke, apiProvider),
    takeEvery('n2o/button/Dummy', handleDummy),
]

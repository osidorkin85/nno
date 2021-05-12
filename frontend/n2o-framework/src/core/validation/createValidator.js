import isEqual from 'lodash/isEqual'
import isArray from 'lodash/isArray'
import isBoolean from 'lodash/isBoolean'
import isFunction from 'lodash/isFunction'
import each from 'lodash/each'
import isEmpty from 'lodash/isEmpty'
import find from 'lodash/find'
import pickBy from 'lodash/pickBy'
import get from 'lodash/get'
import compact from 'lodash/compact'
import map from 'lodash/map'
import has from 'lodash/has'
import flatten from 'lodash/flatten'
import { batchActions } from 'redux-batched-actions'

import { isPromise } from '../../tools/helpers'
import { addFieldMessage, removeFieldMessage } from '../../actions/formPlugin'

import * as presets from './presets'

function findPriorityMessage(messages) {
    return (
        find(messages, { severity: 'danger' }) ||
        find(messages, { severity: 'warning' }) ||
        find(messages, { severity: 'success' })
    )
}

/**
 * есть ли ошибки или нет
 * @param messages
 * @returns {*}
 */
function hasError(messages) {
    return flatten(Object.values(messages)).reduce((res, msg) => msg.severity === 'danger' || res, false)
}

function addError(
    fieldId,
    { text = true, severity = true },
    options = {},
    errors,
) {
    if (!errors[fieldId]) {
        errors[fieldId] = []
    }

    errors[fieldId].push({})
    const last = errors[fieldId].length - 1

    if (isBoolean(text)) {
        errors[fieldId][last].text = options.text
    } else {
        errors[fieldId][last].text = text
    }

    if (isBoolean(severity)) {
        errors[fieldId][last].severity = options.severity
    } else {
        errors[fieldId][last].severity = severity
    }

    return errors
}

function getMultiFields(registeredFields, fieldId) {
    const regExp = new RegExp(`${fieldId}(\\[.*]).*$`)

    return compact(
        map(registeredFields, (field, fieldId) => (regExp.test(fieldId) ? fieldId : null)),
    )
}

/**
 * функция валидации
 * @param validationConfig
 * @param formName
 * @param state
 * @param isTouched
 * @returns
 */
export const validateField = (
    validationConfig,
    formName,
    state,
    isTouched = false,
) => (values, dispatch) => {
    const registeredFields = get(state, ['form', formName, 'registeredFields'])
    const validation = pickBy(validationConfig, (value, key) => get(registeredFields, `${key}.visible`, true))
    const errors = {}
    const promiseList = [Promise.resolve()]

    each(validation, (validationList, fieldId) => {
        if (isArray(validationList)) {
            each(validationList, (options) => {
                const resolveValidationResult = (isValid, fieldId) => {
                    if (isPromise(isValid)) {
                        promiseList.push(
                            new Promise((resolve) => {
                                isValid.then(
                                    (resp) => {
                                        each(resp && resp.message, (message) => {
                                            addError(fieldId, message, options, errors)
                                        })
                                        resolve()
                                    },
                                    () => {
                                        resolve()
                                    },
                                )
                            }),
                        )
                    } else if (!isValid) {
                        addError(fieldId, {}, options, errors)
                    }
                }

                const validationFunction = presets[options.type]

                if (options.multi) {
                    const multiFields = getMultiFields(registeredFields, fieldId)

                    map(multiFields, (fieldId) => {
                        const isValid = isFunction(validationFunction) &&
                            validationFunction(fieldId, values, options, dispatch)

                        resolveValidationResult(isValid, fieldId)
                    })
                } else {
                    const isValid = isFunction(validationFunction) &&
                        validationFunction(fieldId, values, options, dispatch)

                    resolveValidationResult(isValid, fieldId)
                }
            })
        }
    })

    return Promise.all(promiseList).then(() => {
        // eslint-disable-next-line consistent-return
        const messagesAction = map(errors, (messages, fieldId) => {
            if (!isEmpty(messages)) {
                const message = findPriorityMessage(messages)
                const nowTouched = get(registeredFields, [fieldId, 'touched'])

                if (
                    (isTouched && !nowTouched) ||
                    !isEqual(message, get(registeredFields, [fieldId, 'message']))
                ) {
                    return addFieldMessage(formName, fieldId, message, isTouched)
                }
            }
        }).filter(Boolean)

        each(registeredFields, (field, key) => {
            const currentError = has(errors, key)
            const errorInStore = field.message

            if (!currentError && errorInStore) {
                dispatch(removeFieldMessage(formName, key))
            }
        })

        if (messagesAction) {
            dispatch(batchActions(messagesAction))
        }

        return hasError(errors)
    })
}

export default function createValidator(
    validationConfig = {},
    formName,
    state,
    fields,
) {
    return {
        asyncValidate: validateField(validationConfig, formName, state),
        asyncBlurFields: fields || [],
    }
}

import { runSaga } from 'redux-saga'
import { put } from 'redux-saga/effects'
import merge from 'lodash/merge'
import fetchMock from 'fetch-mock'

import {
    FAIL_INVOKE,
    START_INVOKE,
    SUCCESS_INVOKE,
} from '../constants/actionImpls'
import createActionHelper from '../actions/createActionHelper'

import * as api from './fetch'
import {
    handleInvoke,
    fetchInvoke,
    validate,
    handleFailInvoke,
} from './actionsImpl'

/**
 * @deprecated
 */

const dataProvider = {
    method: 'POST',
    pathMapping: {
        __patients_id: {
            link: 'models.resolve[\'__patients\'].id',
        },
    },
    url: 'n2o/data/patients/:__patients_id/vip',
}

const state = {
    models: {
        resolve: {
            __patients: {
                id: 111,
            },
        },
    },
}
fetchMock.restore().post('*', url => ({
    status: 200,
    body: 'test',
}))
describe('Проверка саги actionsImpl', () => {
    it('проверка optimistic режима', async () => {
        const dispatched = []
        const fakeStore = {
            dispatch: action => dispatched.push(action),
            getState: () => ({
                models: {
                    resolve: {
                        __patients: {
                            id: 1,
                            vip: true,
                        },
                    },
                },
            }),
        }

        const action = {
            type: START_INVOKE,
            meta: {
                refresh: true,
            },
            payload: {
                widgetId: '__patients',
                modelId: '__patients',
                modelLink: null,
                dataProvider: {
                    url: '/test',
                    optimistic: true,
                    method: 'POST',
                    pathMapping: {},
                },
                data: {
                    id: 1,
                    vip: false,
                },
            },
        }

        const apiProvider = () => ({
            meta: {},
        })

        await runSaga(fakeStore, handleInvoke, apiProvider, action)
        expect(dispatched[1].payload).toEqual({
            prefix: 'resolve',
            key: '__patients',
            model: {
                id: 1,
                vip: false,
            },
        })
        expect(dispatched[3].type).toBe(SUCCESS_INVOKE)
    })

    it('Проверка генератора handleFetchInvoke', () => {
        const action = {
            meta: {
                fail: {
                    some: 'value',
                },
            },
        }
        const widgetId = 'testId'
        const err = {
            meta: {
                value: 'value',
            },
        }
        const gen = handleFailInvoke(action.meta.fail, widgetId, err.meta)
        const meta = merge(action.meta.fail, err.meta)
        expect(gen.next().value.payload.action).toEqual(
            put(createActionHelper(FAIL_INVOKE)({ widgetId }, meta)).payload.action,
        )
        expect(gen.next().done).toEqual(true)
    })

    it('Проверка генератора validate', async () => {
        const fakeStore = {
            getState: () => ({}),
        }
        const options = {
            validate: true,
            dispatch: () => {},
        }

        const promise = await runSaga(fakeStore, validate, options).toPromise()
        const result = await Promise.resolve(promise)
        expect(result).toEqual(false)
    })

    it('Проверка генератора fetchInvoke', async () => {
        const fakeStore = {
            getState: () => state,
        }
        api.default = jest.fn(() => Promise.resolve({ response: 'response from server' }))
        const promise = await runSaga(
            fakeStore,
            fetchInvoke,
            dataProvider,
            {
                id: 12345,
            },
            {},
            { payload: 1 },
        ).toPromise()
        const result = await Promise.resolve(promise)
        expect(result).toEqual({
            response: 'response from server',
        })
    })
})

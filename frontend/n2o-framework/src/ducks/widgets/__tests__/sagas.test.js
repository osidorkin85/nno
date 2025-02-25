import { runSaga } from 'redux-saga'
import { put } from 'redux-saga/effects'

import { setModel } from '../../models/store'
import { PREFIXES } from '../../models/constants'
import {
    changeCountWidget,
    changePageWidget,
    setWidgetMetadata,
    resetWidgetState,
    dataSuccessWidget,
    dataFailWidget } from '../store'

import {
    prepareFetch,
    runResolve,
    clearOnDisable,
    afterFetch,
    handleFetch,
    clearForm,
} from '../sagas'
import {
    routesQueryMapping,
} from '../sagas/routesQueryMapping'

describe('Проверка саги widgets', () => {
    describe('тесты routesQueryMapping', () => {
        it('должен вызывать replace', async () => {
            const dispatched = []
            const state = {
                test: {
                    id: 123,
                },
                model: {
                    q: 'qqq',
                },
            }
            const routes = {
                list: [
                    {
                        path: '/test',
                        exact: true,
                        isOtherPage: true,
                    },
                    {
                        path: '/testRoot/:id',
                        exact: true,
                        isOtherPage: true,
                        params: {
                            test: {},
                        },
                    },
                ],
                pathMapping: {
                    id: {
                        link: 'test.id',
                    },
                },
                queryMapping: {
                    q: {
                        set: {
                            value: '`q`',
                            link: 'model',
                        },
                    },
                },
            }
            const location = {
                search: '?name=Sergey',
                pathname: '/testRoot/:id',
                hash: '',
            }
            const fakeStore = {
                getState: () => ({}),
                dispatch: action => dispatched.push(action),
            }
            await runSaga(fakeStore, routesQueryMapping, state, routes, location)
            expect(dispatched[0].type).toBe('@@router/CALL_HISTORY_METHOD')
            expect(dispatched[0].payload.args[0].search).toBe('q=qqq&name=Sergey')
        })
    })
    it('clearForm должен вызвать сброс формы', () => {
        const gen = clearForm({
            payload: {
                key: 'testForm',
            },
        })
        const value = gen.next()

        expect(value.value.type).toBe('PUT')
    })
    it('handleFetch должен выпасть с ошибкой', async () => {
        const dispatched = []
        const fakeStore = {
            getState: () => ({}),
            dispatch: action => dispatched.push(action),
        }
        const widgetId = 'testId'
        const modelId = 'testId'
        const options = {}
        await runSaga(
            fakeStore,
            handleFetch,
            modelId,
            widgetId,
            options,
            () => {},
        )
        expect(dispatched[0]).toEqual(put(dataFailWidget(widgetId)).payload.action)
    })

    it('Проверка генератора afterFetch', async () => {
        const dispatched = []
        const widgetId = 'testId'
        const modelId = 'testId'
        const widgetState = {
            pageId: 'pageId',
        }
        const basePath = '/n2o/test'
        const baseQuery = {
            size: 10,
        }
        const fakeStore = {
            getState: () => ({}),
            dispatch: action => dispatched.push(action),
        }
        const response = {
            page: 2,
            size: 10,
            metadata: {
                meta: {},
            },
            list: [],
            count: 14,
        }

        await runSaga(
            fakeStore,
            afterFetch,
            response,
            modelId,
            widgetId,
            widgetState,
            basePath,
            baseQuery,
        )
        expect(dispatched[0]).toEqual(
            put(changeCountWidget(widgetId, response.count)).payload.action,
        )
        expect(dispatched[1]).toEqual(
            put(setModel(PREFIXES.datasource, widgetId, [])).payload.action,
        )
        expect(dispatched[2]).toEqual(
            put(setModel(PREFIXES.resolve, widgetId, null)).payload.action,
        )
        expect(dispatched[3]).toEqual(
            put(changePageWidget(widgetId, response.page)).payload.action,
        )
        expect(dispatched[4]).toEqual(
            put(setWidgetMetadata(widgetState.pageId, widgetId, response.metadata))
                .payload.action,
        )
        expect(dispatched[5]).toEqual(
            put(resetWidgetState(widgetId)).payload.action,
        )
        expect(dispatched[6]).toEqual(
            put(dataSuccessWidget(widgetId, response)).payload.action,
        )
    })

    it('Должен произойти clearOnDisable', () => {
        const action = {
            payload: {
                widgetId: 'testId',
                modelId: 'testId',
            },
        }
        const gen = clearOnDisable(action)
        expect(gen.next().value.payload).toEqual(
            put(setModel(PREFIXES.datasource, action.payload.widgetId, null)).payload,
        )
        expect(gen.next().value.payload).toEqual(
            put(changeCountWidget(action.payload.widgetId, 0)).payload,
        )
    })

    it('Должен произойти runResolve', () => {
        const action = {
            payload: {
                modelId: 'testId',
                model: {
                    some: 'value',
                },
            },
        }
        const gen = runResolve(action)
        expect(gen.next().value.payload).toEqual(
            put(
                setModel(
                    PREFIXES.resolve,
                    action.payload.modelId,
                    action.payload.model,
                ),
            ).payload,
        )
    })

    it('prepareFetch должен вернуть подготовленные даные', async () => {
        const router = {
            location: '/root',
        }
        const dataProvider = {
            url: '/n2o/test',
            queryMapping: {},
            pathMapping: {},
        }
        const widgets = {
            testWidget: {
                pageId: 'testPage',
                some: 'value',
                dataProvider,
            },
        }
        const routes = [
            {
                path: '/test',
                exact: true,
                isOtherPage: false,
            },
        ]
        const pages = {
            testPage: {
                metadata: {
                    routes,
                },
            },
        }
        const fakeStore = {
            getState: () => ({
                router,
                widgets,
                pages,
            }),
        }
        const widgetId = 'testWidget'
        const saga = await runSaga(fakeStore, prepareFetch, widgetId)
        const result = await Promise.resolve(saga.toPromise())
        expect(result).toEqual({
            dataProvider,
            location: router.location,
            routes,
            state: {
                pages,
                router,
                widgets,
            },
            widgetState: widgets[widgetId],
        })
    })
})

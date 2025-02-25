import widgets, {
    registerWidget,
    dataRequestWidget,
    dataSuccessWidget,
    dataFailWidget,
    resolveWidget,
    showWidget,
    hideWidget,
    enableWidget,
    disableWidget,
    disableWidgetOnFetch,
    loadingWidget,
    unloadingWidget,
    sortByWidget,
    changeSizeWidget,
    setTableSelectedId,
    setActive,
    changeCountWidget,
    changePageWidget,
    changeFiltersVisibility,
    toggleWidgetFilters,
    resetWidgetState,
    removeWidget,
} from '../store'

describe('Тесты widget reducer', () => {
    it('Проверка REGISTER', () => {
        expect(
            widgets(
                {
                    'Page.Widget': {},
                },
                {
                    type: registerWidget.type,
                    payload: {
                        widgetId: 'Page.Widget',
                        initProps: {
                            modelId: 'Page.Widget',
                            containerId: 'containerId',
                            count: 1,
                            dataProvider: {
                                url: 'n2o/data',
                            },
                            filter: {
                                key: 'name',
                                type: 'includes',
                            },
                            isActive: true,
                            isEnabled: true,
                            isFilterVisible: false,
                            page: 2,
                            pageId: 'page-id-2',
                            selectedId: 'selected-3',
                            size: 20,
                            sorting: {
                                name: 'ASC',
                            },
                            type: 'table',
                        },
                    },
                },
            ),
        ).toEqual({
            'Page.Widget': {
                modelId: 'Page.Widget',
                containerId: 'containerId',
                count: 1,
                dataProvider: {
                    url: 'n2o/data',
                },
                filter: {
                    key: 'name',
                    type: 'includes',
                },
                isActive: true,
                isEnabled: true,
                isFilterVisible: false,
                isInit: true,
                isLoading: false,
                isResolved: false,
                isVisible: true,
                page: 2,
                pageId: 'page-id-2',
                selectedId: 'selected-3',
                size: 20,
                sorting: {
                    name: 'ASC',
                },
                type: 'table',
                validation: {},
                error: null,
            },
        })
    })

    it('Проверка DATA_REQUEST', () => {
        expect(
            widgets(
                {
                    widget: {},
                },
                {
                    type: dataRequestWidget.type,
                    payload: {
                        widgetId: 'widget',
                    },
                },
            ),
        ).toEqual({
            widget: {
                isLoading: true,
            },
        })
    })

    it('Проверка DATA_SUCCESS', () => {
        expect(
            widgets(
                {
                    widget: {},
                },
                {
                    type: dataSuccessWidget.type,
                    payload: {
                        widgetId: 'widget',
                    },
                },
            ),
        ).toEqual({
            widget: {
                isLoading: false,
            },
        })
    })

    it('Проверка DATA_FAIL', () => {
        expect(
            widgets(
                {
                    widget: {},
                },
                {
                    type: dataFailWidget.type,
                    payload: {
                        widgetId: 'widget',
                        err: 'someError',
                    },
                },
            ),
        ).toEqual({
            widget: {
                isLoading: false,
                error: 'someError',
            },
        })
    })

    it('Проверка RESOLVE', () => {
        expect(
            widgets(
                {
                    widget: {},
                },
                {
                    type: resolveWidget.type,
                    payload: {
                        widgetId: 'widget',
                    },
                },
            ),
        ).toEqual({
            widget: {
                isResolved: true,
            },
        })
    })

    it('Проверка SHOW', () => {
        expect(
            widgets(
                {
                    widget: {},
                },
                {
                    type: showWidget.type,
                    payload: {
                        widgetId: 'widget'
                    },
                },
            ),
        ).toEqual({
            widget: {
                isVisible: true,
            },
        })
    })

    it('Проверка HIDE', () => {
        expect(
            widgets(
                {
                    widget: {},
                },
                {
                    type: hideWidget.type,
                    payload: {
                        widgetId: 'widget'
                    },
                },
            ),
        ).toEqual({
            widget: {
                isVisible: false,
            },
        })
    })

    it('Проверка ENABLE', () => {
        expect(
            widgets(
                {
                    widget: {},
                },
                {
                    type: enableWidget.type,
                    payload: {
                        widgetId: 'widget'
                    },
                },
            ),
        ).toEqual({
            widget: {
                isEnabled: true,
            },
        })
    })

    it('Проверка DISABLE', () => {
        expect(
            widgets(
                {
                    widget: {},
                },
                {
                    type: disableWidget.type,
                    payload: {
                        widgetId: 'widget'
                    },
                },
            ),
        ).toEqual({
            widget: {
                isEnabled: false,
            },
        })
    })

    it('Проверка DISABLE_ON_FETCH', () => {
        expect(
            widgets(
                {
                    widget: {},
                },
                {
                    type: disableWidgetOnFetch.type,
                    payload: {
                        widgetId: 'widget'
                    },
                },
            ),
        ).toEqual({
            widget: {
                isEnabled: false,
            },
        })
    })

    it('Проверка LOADING', () => {
        expect(
            widgets(
                {
                    widget: {},
                },
                {
                    type: loadingWidget.type,
                    payload: {
                        widgetId: 'widget'
                    },
                },
            ),
        ).toEqual({
            widget: {
                isLoading: true,
            },
        })
    })

    it('Проверка UNLOADING', () => {
        expect(
            widgets(
                {
                    widget: {},
                },
                {
                    type: unloadingWidget.type,
                    payload: {
                        widgetId: 'widget'
                    },
                },
            ),
        ).toEqual({
            widget: {
                isLoading: false,
            },
        })
    })

    it('Проверка SORT_BY', () => {
        expect(
            widgets(
                {
                    widget: {},
                },
                {
                    type: sortByWidget.type,
                    payload: {
                        widgetId: 'widget',
                        sortDirection: 'DESC',
                        fieldKey: 'name',
                    },
                },
            ),
        ).toEqual({
            widget: {
                sorting: {
                    name: 'DESC',
                },
            },
        })
    })

    it('Проверка CHANGE_SIZE', () => {
        expect(
            widgets(
                {
                    widget: {
                        size: 20,
                    },
                },
                {
                    type: changeSizeWidget.type,
                    payload: {
                        widgetId: 'widget',
                        size: 50,
                    },
                },
            ),
        ).toEqual({
            widget: {
                size: 50,
            },
        })
    })

    it('Проверка CHANGE_PAGE', () => {
        expect(
            widgets(
                {
                    widget: {
                        page: 1,
                    },
                },
                {
                    type: changePageWidget.type,
                    payload: {
                        widgetId: 'widget',
                        page: 5,
                    },
                },
            ),
        ).toEqual({
            widget: {
                page: 5,
            },
        })
    })

    it('Проверка CHANGE_COUNT', () => {
        expect(
            widgets(
                {
                    widget: {
                        count: 1,
                    },
                },
                {
                    type: changeCountWidget.type,
                    payload: {
                        widgetId: 'widget',
                        count: 3,
                    },
                },
            ),
        ).toEqual({
            widget: {
                count: 3,
            },
        })
    })

    it('Проверка CHANGE_FILTERS_VISIBILITY', () => {
        expect(
            widgets(
                {
                    widget: {
                        isFilterVisible: false,
                    },
                },
                {
                    type: changeFiltersVisibility.type,
                    payload: {
                        widgetId: 'widget',
                        isFilterVisible: true,
                    },
                },
            ),
        ).toEqual({
            widget: {
                isFilterVisible: true,
            },
        })
    })

    it('Проверка TOGGLE_FILTERS_VISIBILITY', () => {
        expect(
            widgets(
                {
                    widget: {
                        isFilterVisible: true,
                    },
                },
                {
                    type: toggleWidgetFilters.type,
                    payload: {
                        widgetId: 'widget'
                    },
                },
            ),
        ).toEqual({
            widget: {
                isFilterVisible: false,
            },
        })
    })

    it('Проверка RESET_STATE', () => {
        expect(
            widgets(
                {
                    widget: {},
                },
                {
                    type: resetWidgetState.type,
                    payload: {
                        widgetId: 'widget'
                    },
                },
            ),
        ).toEqual({
            widget: {
                isInit: false,
            },
        })
    })

    it('Проверка SET_TABLE_SELECTED_ID', () => {
        expect(
            widgets(
                {
                    widget: {},
                },
                {
                    type: setTableSelectedId.type,
                    payload: {
                        widgetId: 'widget',
                        value: 'testId',
                    },
                },
            ),
        ).toEqual({
            widget: {
                selectedId: 'testId',
            },
        })
    })

    it('Проверка SET_TABLE_SELECTED_ID', () => {
        expect(
            widgets(
                {
                    widget: {},
                },
                {
                    type: setTableSelectedId.type,
                    payload: {
                        widgetId: 'widget',
                        value: 613241,
                    },
                },
            ),
        ).toEqual({
            widget: {
                selectedId: 613241,
            },
        })
    })

    it('Проверка SET_ACTIVE', () => {
        expect(
            widgets(
                {
                    widget: {
                        isActive: false,
                    },
                },
                {
                    type: setActive.type,
                    payload: {
                        widgetId: 'widget'
                    },
                },
            ),
        ).toEqual({
            widget: {
                isActive: true,
            },
        })
    })

    it('Проверка REMOVE', () => {
        expect(
            widgets(
                {
                    widget: {
                        isActive: true,
                        containerId: 'id',
                    },
                },
                {
                    type: removeWidget.type,
                    payload: 'widget',
                },
            ),
        ).toEqual({})
    })
})

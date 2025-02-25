import React from 'react'
import PropTypes from 'prop-types'

import { dependency } from '../../../core/dependency'
import StandardWidget from '../StandardWidget'
import { StandardFieldset } from '../Form/fieldsets'
import { getN2OPagination } from '../Table/N2OPagination'
import { pagingType } from '../../snippets/Pagination/types'

import CardsContainer from './CardsContainer'

function CardsWidget(
    {
        id: widgetId,
        datasource: modelId = widgetId,
        toolbar,
        disabled,
        pageId,
        className,
        style,
        filter,
        dataProvider,
        fetchOnInit,
        paging,
        cards,
        verticalAlign,
        height,
    },
    context,
) {
    const { size, place = 'bottomLeft' } = paging
    const prepareFilters = () => context.resolveProps(filter, StandardFieldset)

    return (
        <StandardWidget
            disabled={disabled}
            widgetId={widgetId}
            modelId={modelId}
            toolbar={toolbar}
            filter={prepareFilters()}
            {...getN2OPagination(paging, place, widgetId, modelId)}
            className={className}
            style={style}
        >
            <CardsContainer
                page={1}
                size={size}
                pageId={pageId}
                disabled={disabled}
                dataProvider={dataProvider}
                widgetId={widgetId}
                modelId={modelId}
                fetchOnInit={fetchOnInit}
                cards={cards}
                align={verticalAlign}
                height={height}
            />
        </StandardWidget>
    )
}

CardsWidget.propTypes = {
    id: PropTypes.string,
    datasource: PropTypes.string,
    toolbar: PropTypes.object,
    disabled: PropTypes.bool,
    pageId: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    filter: PropTypes.object,
    dataProvider: PropTypes.object,
    fetchOnInit: PropTypes.bool,
    cards: PropTypes.array,
    align: PropTypes.string,
    height: PropTypes.string,
    paging: pagingType,
    verticalAlign: PropTypes.string,
}

CardsWidget.defaultProps = {
    toolbar: {},
    disabled: false,
    filter: {},
    paging: {
        size: 10,
        prev: true,
        next: true,
    },
}

CardsWidget.contextTypes = {
    resolveProps: PropTypes.func,
}

export default dependency(CardsWidget)

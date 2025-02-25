import React from 'react'
import isEqual from 'lodash/isEqual'
import each from 'lodash/each'
import concat from 'lodash/concat'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import {
    showMultiFields,
    hideMultiFields,
    enableMultiFields,
    disableMultiFields,
} from '../../../ducks/form/store'
import { makeGetResolveModelSelector } from '../../../ducks/models/selectors'
import propsResolver from '../../../utils/propsResolver'

import Label from './fields/StandardField/Label'
// eslint-disable-next-line import/no-cycle
import FieldsetRow from './FieldsetRow'
import { resolveExpression } from './utils'

/**
 * Компонент - филдсет формы
 * @reactProps {array} rows - ряды, которые содержит филдсет. Они содержат колонки, которые содержат либо поля, либо филдсеты(филдсет рекрсивный).
 * @reactProps {string} className - класс компонента Fieldset
 * @reactProps {string} labelPosition - позиция лейбела относительно контрола: top-left, top-right, left, right.
 * @reactProps {string} label - заголовок филдсета
 * @reactProps {string} childrenLabel - заголовоки дочерних элементов  филдсета
 * @reactProps {array} labelWidth - ширина лейбела - Либо число, либо 'min' - займет минимальное возможное пространство, либо default - 100px
 * @reactProps {array} labelAlignment - выравнивание текста внутри лейбла
 * @reactProps {number} defaultCol
 * @reactProps {number|string} autoFocusId
 * @reactProps {node} component
 * @reactProps {node} children
 * @example
 *
 * //пример структуры rows
 * const rows = [
 *    {
 *      "cols": [
 *        {
 *          "fields": [
 *            {
 *            //...
 *            }
 *          ]
 *        },
 *        {
 *          "fields": [
 *            {
 *            //...
 *            }
 *          ]
 *        },
 *        {
 *          "fields": [
 *            {
 *            //...
 *            }
 *          ]
 *        },
 *      ]
 *    },
 *    {
 *      "cols": [
 *        {
 *          "fieldsets": [
 *            {
 *            "rows": [
 *            //...
 *            ]
 *            }
 *          ]
 *        },
 *        {
 *          "fields": [
 *            {
 *            //...
 *            },
 *            {
 *            //...
 *            }
 *          ]
 *        },
 *      ]
 *    }
 *  ]
 *
 *  <Fieldset rows={rows}>
 *
 */

class Fieldset extends React.Component {
    constructor(props) {
        super(props)

        this.setVisible = this.setVisible.bind(this)
        this.setEnabled = this.setEnabled.bind(this)
        this.getFormValues = this.getFormValues.bind(this)
        this.renderRow = this.renderRow.bind(this)

        this.state = {
            visible: true,
            enabled: true,
        }

        this.fields = []
    }

    componentDidMount() {
        this.resolveProperties()
    }

    componentDidUpdate(prevProps) {
        const { visible, enabled, activeModel } = this.props

        if (
            isEqual(activeModel, prevProps.activeModel) &&
                isEqual(visible, prevProps.visible) &&
                isEqual(enabled, prevProps.enabled)
        ) {
            return
        }
        this.resolveProperties()
    }

    resolveProperties() {
        const { visible, enabled, activeModel } = this.props
        const {
            enabled: enabledFromState,
            visible: visibleFromState,
        } = this.state

        const newEnabled = resolveExpression(enabled, activeModel)
        const newVisible = resolveExpression(visible, activeModel)

        if (!isEqual(newEnabled, enabledFromState)) {
            this.setEnabled(newEnabled)
        }

        if (!isEqual(newVisible, visibleFromState)) {
            this.setVisible(newVisible)
        }
    }

    setVisible(nextVisibleField) {
        const { showMultiFields, hideMultiFields, form } = this.props

        this.setState(() => {
            if (nextVisibleField) {
                showMultiFields(form, this.fields)
            } else {
                hideMultiFields(form, this.fields)
            }

            return {
                visible: nextVisibleField,
            }
        })
    }

    setEnabled(nextEnabledField) {
        const { enableMultiFields, disableMultiFields, form } = this.props

        if (nextEnabledField) {
            enableMultiFields(form, this.fields)
        } else {
            disableMultiFields(form, this.fields)
        }
        this.setState({
            enabled: nextEnabledField,
        })
    }

    getFormValues(store) {
        const { form } = this.props
        const state = store.getState()

        return makeGetResolveModelSelector(form)(state)
    }

    calculateAllFields(rows) {
        let fields = []

        each(rows, (row) => {
            each(row.cols, (col) => {
                if (col.fieldsets) {
                    each(col.fieldsets, (fieldset) => {
                        fields = concat(fields, this.calculateAllFields(fieldset.rows))
                    })
                } else if (col.fields) {
                    each(col.fields, (field) => {
                        fields.push(field.id)
                    })
                }
            })
        })

        return fields
    }

    renderRow(rowId, row, props) {
        const {
            labelPosition,
            labelWidth,
            labelAlignment,
            defaultCol,
            autoFocusId,
            form,
            modelPrefix,
            autoSubmit,
            activeModel,
            activeField,
        } = this.props

        const { enabled } = this.state

        return (
            <FieldsetRow
                activeModel={activeModel}
                key={rowId}
                row={row}
                rowId={rowId}
                labelPosition={labelPosition}
                labelWidth={labelWidth}
                labelAlignment={labelAlignment}
                defaultCol={defaultCol}
                autoFocusId={autoFocusId}
                form={form}
                modelPrefix={modelPrefix}
                disabled={!enabled}
                autoSubmit={autoSubmit}
                activeField={activeField}
                {...props}
            />
        )
    }

    render() {
        const {
            className,
            style,
            component: ElementType,
            children,
            parentName,
            parentIndex,
            label,
            description,
            type,
            childrenLabel,
            activeModel,
            ...rest
        } = this.props

        const { enabled, visible } = this.state

        this.fields = []

        const needLabel = label && type !== 'line'
        const needDescription = description && type !== 'line'

        if (React.Children.count(children)) {
            return <ElementType>{children}</ElementType>
        }

        const classes = classNames('n2o-fieldset', className, {
            'd-none': !visible,
        })

        const resolveLabel = activeModel ? propsResolver(label, activeModel) : label

        return (
            <div className={classes} style={style}>
                {(needLabel || needDescription) && (
                    <div className="n2o-fieldset__label-container">
                        {needLabel && (
                            <Label
                                className={classNames(
                                    'n2o-fieldset__label', { 'with-description': description },
                                )}
                                value={resolveLabel}
                            />
                        )}
                        {needDescription && (
                            <Label
                                className={classNames(
                                    'n2o-fieldset__description', { 'line-description': type === 'line' },
                                )}
                                value={description}
                            />
                        )}
                    </div>
                )}
                <ElementType
                    childrenLabel={childrenLabel}
                    enabled={enabled}
                    label={resolveLabel}
                    type={type}
                    activeModel={activeModel}
                    description={description}
                    {...rest}
                    render={(rows, props = { parentName, parentIndex }) => {
                        this.fields = this.calculateAllFields(rows)

                        return rows.map((row, id) => this.renderRow(id, row, props))
                    }}
                />
            </div>
        )
    }
}

Fieldset.propTypes = {
    rows: PropTypes.array,
    className: PropTypes.string,
    label: PropTypes.string,
    childrenLabel: PropTypes.string,
    labelPosition: PropTypes.string,
    description: PropTypes.string,
    labelWidth: PropTypes.array,
    labelAlignment: PropTypes.array,
    defaultCol: PropTypes.number,
    autoFocusId: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.oneOf([false])]),
    component: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
        PropTypes.func,
    ]),
    children: PropTypes.node,
    visible: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    enabled: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    dependency: PropTypes.array,
    form: PropTypes.string,
    showMultiFields: PropTypes.func,
    hideMultiFields: PropTypes.func,
    enableMultiFields: PropTypes.func,
    disableMultiFields: PropTypes.func,
    modelPrefix: PropTypes.string,
    type: PropTypes.string,
    parentName: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    parentIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    activeModel: PropTypes.object,
    style: PropTypes.object,
    autoSubmit: PropTypes.bool,
    activeField: PropTypes.string,
}

Fieldset.defaultProps = {
    labelPosition: 'top-left',
    component: 'div',
}

Fieldset.contextTypes = {
    store: PropTypes.object,
}

const mapDispatchToProps = dispatch => bindActionCreators(
    {
        showMultiFields,
        hideMultiFields,
        enableMultiFields,
        disableMultiFields,
    },
    dispatch,
)

const FieldsetContainer = connect(
    null,
    mapDispatchToProps,
)(Fieldset)

export default FieldsetContainer

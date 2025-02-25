import React from 'react'
import get from 'lodash/get'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { setModel } from '../../../../../ducks/models/store'
import { setTableSelectedId } from '../../../../../ducks/widgets/store'
import { PREFIXES } from '../../../../../ducks/models/constants'
import { makeGetResolveModelSelector } from '../../../../../ducks/models/selectors'

export default (EditableCell) => {
    class EditableCellWithActions extends React.PureComponent {
        render() {
            return <EditableCell {...this.props} />
        }
    }

    const mapStateToProps = createStructuredSelector({
        prevResolveModel: (state, props) => makeGetResolveModelSelector(props.modelId)(state) || {},
    })

    const mapDispatchToProps = (dispatch, ownProps) => ({
        onResolve: () => dispatch(setModel(PREFIXES.resolve, ownProps.modelId, ownProps.model)),
        onSetSelectedId: () => dispatch(
            setTableSelectedId(ownProps.widgetId, get(ownProps, 'model.id', null)),
        ),
    })

    return connect(
        mapStateToProps,
        mapDispatchToProps,
    )(EditableCellWithActions)
}

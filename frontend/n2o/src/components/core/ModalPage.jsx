import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { compose } from 'recompose';
import Page from './Page';
import { connect } from 'react-redux';
import cn from 'classnames';
import { createStructuredSelector } from 'reselect';
import {
  makePageDisabledByIdSelector,
  makePageLoadingByIdSelector,
  makePageTitleByIdSelector,
} from '../../selectors/pages';
import Actions from '../actions/Actions';
import factoryResolver from '../../utils/factoryResolver';
import withActions from './withActions';
import Spinner from '../snippets/Spinner/Spinner';
import { makeShowPromptByName } from '../../selectors/overlays';

/**
 * Компонент, отображающий модальное окно
 * @reactProps {string} pageId - id пейджа
 * @reactProps {string} name - имя модалки
 * @reactProps {boolean} visible - отображается модалка или нет
 * @reactProps {string} size - размер('sm' или 'lg')
 * @reactProps {string} title - заголовок в хэдере
 * @reactProps {boolean} closeButton - Есть кнопка закрытия или нет
 * @reactProps {object} actions - объект экшнов
 * @reactProps {array} toolbar - массив, описывающий внений вид кнопок-экшенов
 * @reactProps {object} props - аргументы для экшенов-функций
 * @reactProps {boolean}  disabled - блокировка модалки
 * @reactProps {function}  hidePrompt - скрытие окна подтверждения
 * @example
 *  <ModalPage props={props}
 *             actions={actions}
 *             name={name}
 *             pageId={pageId}
 *  />
 */
class ModalPage extends React.Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.closePrompt = this.closePrompt.bind(this);
    this.showPrompt = this.showPrompt.bind(this);
  }

  renderFromSrc(src) {
    const Component = factoryResolver(src, null);
    return <Component />;
  }

  closeModal(prompt) {
    const { name, close } = this.props;
    close(name, prompt);
  }

  closePrompt() {
    const { name, hidePrompt } = this.props;
    hidePrompt(name);
  }

  showPrompt() {
    if (window.confirm(this.context.defaultPromptMessage)) {
      this.closeModal(false);
    } else {
      this.closePrompt();
    }
  }

  render() {
    const {
      pageUrl,
      pageId,
      src,
      pathMapping,
      queryMapping,
      size,
      actions,
      containerKey,
      toolbar,
      visible,
      title,
      loading,
      disabled,
      showPrompt,
    } = this.props;

    const pageMapping = {
      pathMapping,
      queryMapping,
    };

    const showSpinner = !visible || loading || typeof loading === 'undefined';
    const classes = cn({ 'd-none': loading });
    return (
      <div className={cn('modal-page-overlay')}>
        {showPrompt && this.showPrompt()}
        <Spinner type="cover" loading={showSpinner} color="light" transparent>
          <Modal
            isOpen={visible}
            toggle={() => this.closeModal(false)}
            size={size}
            backdrop={false}
            style={{
              zIndex: 10,
            }}
          >
            <ModalHeader
              className={classes}
              toggle={() => this.closeModal(false)}
            >
              {title}
            </ModalHeader>
            <ModalBody className={classes}>
              {pageUrl ? (
                <Page
                  pageUrl={pageUrl}
                  pageId={pageId}
                  pageMapping={pageMapping}
                  needMetadata
                />
              ) : src ? (
                this.renderFromSrc(src)
              ) : null}
            </ModalBody>
            {toolbar && (
              <ModalFooter className={classes}>
                <div
                  className={cn('n2o-modal-actions', {
                    'n2o-disabled': disabled,
                  })}
                >
                  <Actions
                    toolbar={toolbar.bottomLeft}
                    actions={actions}
                    containerKey={containerKey}
                    pageId={pageId}
                  />
                  <Actions
                    toolbar={toolbar.bottomRight}
                    actions={actions}
                    containerKey={containerKey}
                    pageId={pageId}
                  />
                </div>
              </ModalFooter>
            )}
          </Modal>
        </Spinner>
      </div>
    );
  }
}

export const ModalWindow = ModalPage;

ModalPage.propTypes = {
  pageId: PropTypes.string,
  visible: PropTypes.bool,
  size: PropTypes.oneOf(['lg', 'sm']),
  title: PropTypes.string,
  closeButton: PropTypes.bool,
  toolbar: PropTypes.array,
  name: PropTypes.string,
  actions: PropTypes.object,
  props: PropTypes.object,
  close: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

ModalPage.defaultProps = {
  size: 'lg',
  disabled: false,
};

ModalPage.contextTypes = {
  defaultPromptMessage: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  title: (state, { pageId }) => makePageTitleByIdSelector(pageId)(state),
  loading: (state, { pageId }) => makePageLoadingByIdSelector(pageId)(state),
  disabled: (state, { pageId }) => makePageDisabledByIdSelector(pageId)(state),
  showPrompt: (state, { name }) => makeShowPromptByName(name)(state),
});

export default compose(
  connect(mapStateToProps),
  withActions
)(ModalPage);

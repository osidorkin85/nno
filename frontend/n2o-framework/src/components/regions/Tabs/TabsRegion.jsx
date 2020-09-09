import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';
import map from 'lodash/map';
import find from 'lodash/find';
import get from 'lodash/get';
import pull from 'lodash/pull';
import isNil from 'lodash/isNil';
import { compose, setDisplayName } from 'recompose';
import withRegionContainer from '../withRegionContainer';
import Tabs from './Tabs';
import Tab from './Tab';
import withWidgetProps from '../withWidgetProps';
import { WIDGETS } from '../../../core/factory/factoryLevels';

import Factory from '../../../core/factory/Factory';
import SecurityCheck from '../../../core/auth/SecurityCheck';

import RegionContent from '../RegionContent';

/**
 * Регион Таб
 * @reactProps {array} items - массив из объектов, которые описывают виджет {id, name, opened, pageId, fetchOnInit, widget}
 * @reactProps {function} getWidget - функция получения виджета
 * @reactProps {string} pageId - идентификатор страницы
 * @reactProps {function} resolveVisibleDependency - резол видимости таба
 */
class TabRegion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      readyTabs: this.findReadyTabs(),
      visibleTabs: {},
    };
    this.handleChangeActive = this.handleChangeActive.bind(this);
  }

  componentWillUnmount() {
    this.props.changeActiveEntity(null);
  }

  handleChangeActive(id, prevId) {
    const {
      items,
      lazy,
      alwaysRefresh,
      getWidgetProps,
      fetchWidget,
      changeActiveEntity,
    } = this.props;
    const { readyTabs } = this.state;
    const widgetId = get(
      find(items, ({ id: tabId }) => tabId === id),
      'widgetId'
    );
    const widgetProps = getWidgetProps(widgetId);

    if (lazy) {
      if (alwaysRefresh) {
        pull(readyTabs, prevId);
      }
      readyTabs.push(id);
      this.setState(() => ({
        readyTabs: [...readyTabs],
      }));
    } else if (alwaysRefresh || isEmpty(widgetProps.datasource)) {
      widgetProps.dataProvider && fetchWidget(widgetId);
    }

    changeActiveEntity(id);
  }

  findReadyTabs() {
    return filter(
      map(this.props.items, tab => {
        if (tab.opened) {
          return tab.id;
        }
      }),
      item => item
    );
  }

  render() {
    const {
      items,
      getWidget,
      getWidgetProps,
      getVisible,
      pageId,
      lazy,
      activeEntity,
    } = this.props;
    const { readyTabs, visibleTabs } = this.state;
    return (
      <Tabs activeId={activeEntity} onChangeActive={this.handleChangeActive}>
        {items.map(tab => {
          const { security, content } = tab;

          const widgetProps = getWidgetProps(tab.widgetId);
          const widgetMeta = getWidget(pageId, tab.widgetId);
          const dependencyVisible = getVisible(pageId, tab.widgetId);
          const widgetVisible = get(widgetProps, 'isVisible', true);
          const tabVisible = get(visibleTabs, tab.widgetId, true);
          const tabHasContent = !isNil(content);

          const tabProps = {
            key: tab.id,
            id: tab.id,
            title: tab.label || tab.widgetId,
            icon: tab.icon,
            active: tab.opened,
            visible: dependencyVisible && widgetVisible && tabVisible,
          };
          const tabEl = (
            <Tab {...tabProps}>
              {lazy ? (
                readyTabs.includes(tab.id) && (
                  <Factory id={tab.widgetId} level={WIDGETS} {...widgetMeta} />
                )
              ) : (
                <Factory id={tab.widgetId} level={WIDGETS} {...widgetMeta} />
              )}
              {tabHasContent && <RegionContent content={content} />}
            </Tab>
          );

          const onPermissionsSet = permissions => {
            this.setState(prevState => ({
              visibleTabs: {
                ...prevState.visibleTabs,
                [tab.widgetId]: !!permissions,
              },
            }));
          };

          return isEmpty(security) ? (
            tabEl
          ) : (
            <SecurityCheck
              {...tabProps}
              config={security}
              onPermissionsSet={onPermissionsSet}
              render={({ permissions, active, visible }) => {
                return permissions
                  ? React.cloneElement(tabEl, { active, visible })
                  : null;
              }}
            />
          );
        })}
      </Tabs>
    );
  }
}

TabRegion.propTypes = {
  /**
   * Список табов
   */
  items: PropTypes.array.isRequired,
  getWidget: PropTypes.func.isRequired,
  /**
   * ID странцы
   */
  pageId: PropTypes.string.isRequired,
  alwaysRefresh: PropTypes.bool,
  mode: PropTypes.oneOf(['single', 'all']),
  /**
   * Флаг ленивого рендера
   */
  lazy: PropTypes.bool,
  resolveVisibleDependency: PropTypes.func,
};

TabRegion.defaultProps = {
  alwaysRefresh: false,
  lazy: false,
  mode: 'single',
};

export { TabRegion };
export default compose(
  setDisplayName('TabsRegion'),
  withRegionContainer({ listKey: 'items' }),
  withWidgetProps
)(TabRegion);

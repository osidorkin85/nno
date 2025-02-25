package net.n2oapp.framework.config.metadata.compile.action;

import net.n2oapp.framework.api.exception.N2oException;
import net.n2oapp.framework.api.metadata.ReduxModel;
import net.n2oapp.framework.api.metadata.aware.IdAware;
import net.n2oapp.framework.api.metadata.aware.ModelAware;
import net.n2oapp.framework.api.metadata.compile.CompileContext;
import net.n2oapp.framework.api.metadata.compile.CompileProcessor;
import net.n2oapp.framework.api.metadata.event.action.N2oAction;
import net.n2oapp.framework.api.metadata.global.dao.N2oParam;
import net.n2oapp.framework.api.metadata.local.util.StrictMap;
import net.n2oapp.framework.api.metadata.meta.ModelLink;
import net.n2oapp.framework.api.metadata.meta.action.Action;
import net.n2oapp.framework.config.metadata.compile.BaseSourceCompiler;
import net.n2oapp.framework.config.metadata.compile.ComponentScope;
import net.n2oapp.framework.config.metadata.compile.ParentRouteScope;
import net.n2oapp.framework.config.metadata.compile.context.PageContext;
import net.n2oapp.framework.config.metadata.compile.page.PageScope;
import net.n2oapp.framework.config.metadata.compile.widget.WidgetScope;
import net.n2oapp.framework.config.register.route.RouteUtil;
import net.n2oapp.framework.config.util.CompileUtil;

import java.util.List;
import java.util.Map;

import static net.n2oapp.framework.config.metadata.compile.dataprovider.ClientDataProviderUtil.getWidgetIdByComponentScope;

/**
 * Абстрактная реализация компиляции действия
 */
public abstract class AbstractActionCompiler<D extends Action, S extends N2oAction>
        implements BaseSourceCompiler<D, S, CompileContext<?, ?>> {

    public void compileAction(D compiled, S source, CompileProcessor p) {
        if (source.getId() == null) {
            ComponentScope componentScope = p.getScope(ComponentScope.class);
            if (componentScope != null) {
                IdAware component = componentScope.unwrap(IdAware.class);
                if (component != null) {
                    source.setId(component.getId());
                } else {
                    WidgetScope widgetScope = p.getScope(WidgetScope.class);
                    if (widgetScope != null) {
                        source.setId(widgetScope.getClientWidgetId() + "_row");
                    }
                }
            }
        }
    }

    /**
     * Инициализация целевого виджета действия
     */
    protected String initTargetWidget(CompileContext<?, ?> context, CompileProcessor p) {
        PageScope pageScope = p.getScope(PageScope.class);
        WidgetScope widgetScope = p.getScope(WidgetScope.class);
        String targetWidgetId = getWidgetIdByComponentScope(p);
        if (targetWidgetId == null) {
            if (widgetScope != null) {
                targetWidgetId = widgetScope.getClientWidgetId();
            } else if (context instanceof PageContext && ((PageContext) context).getResultWidgetId() != null) {
                targetWidgetId = pageScope.getGlobalWidgetId(((PageContext) context).getResultWidgetId());
            } else {
                throw new N2oException("Unknown widgetId for invoke action!");
            }
        }
        return targetWidgetId;
    }

    protected ReduxModel getTargetWidgetModel(CompileProcessor p, ReduxModel defaultModel) {
        ComponentScope componentScope = p.getScope(ComponentScope.class);
        if (componentScope != null) {
            ModelAware modelAware = componentScope.unwrap(ModelAware.class);
            if (modelAware != null && modelAware.getModel() != null) {
                return modelAware.getModel();
            }
        }
        return defaultModel;
    }

    /**
     * Сборка родительских маппингов путей
     *
     * @param routeScope Информация о родительском маршруте
     * @param url        Маршрут
     * @return Map родительских маппингов путей
     */
    protected Map<String, ModelLink> initParentRoutePathMappings(ParentRouteScope routeScope, String url) {
        Map<String, ModelLink> parentRoutePathMappings = new StrictMap<>();
        if (routeScope != null && routeScope.getPathMapping() != null) {
            List<String> pathParams = RouteUtil.getParams(url);
            routeScope.getPathMapping().forEach((k, v) -> {
                if (pathParams.contains(k)) {
                    parentRoutePathMappings.put(k, v);
                }
            });
        }
        return parentRoutePathMappings;
    }

    /**
     * Инициализация маппингов для query и path параметров
     *
     * @param pathParams   Исходные модели параметров пути
     * @param queryParams  Исходные модели параметров запроса
     * @param pathMapping  Map, в которую будет произведена сборка собранных параметров пути
     * @param queryMapping Map, в которую будет произведена сборка собранных параметров запроса
     * @param p            Процессор сборки метаданных
     */
    protected void initMappings(N2oParam[] pathParams, N2oParam[] queryParams,
                                Map<String, ModelLink> pathMapping, Map<String, ModelLink> queryMapping,
                                CompileProcessor p) {
        WidgetScope scope = p.getScope(WidgetScope.class);
        if (scope != null) {
            String defaultClientWidgetId = getDefaultClientWidgetId(scope, p);
            ReduxModel defaultModel = getTargetWidgetModel(p, ReduxModel.RESOLVE);
            if (pathParams != null)
                for (N2oParam pathParam : pathParams)
                    pathMapping.put(pathParam.getName(), initParamModelLink(pathParam, defaultClientWidgetId, defaultModel, p));
            if (queryParams != null)
                for (N2oParam queryParam : queryParams)
                    queryMapping.put(queryParam.getName(), initParamModelLink(queryParam, defaultClientWidgetId, defaultModel, p));
        }
    }

    /**
     * Инициализация модели ссылки параметра
     *
     * @param param                 Исходная модель параметра
     * @param defaultClientWidgetId Идентификатор виджета по умолчанию
     * @param defaultModel          Модель по умолчанию
     * @param p                     Процессор сборки метаданных
     * @return Модель ссылки параметра
     */
    private ModelLink initParamModelLink(N2oParam param, String defaultClientWidgetId, ReduxModel defaultModel, CompileProcessor p) {
        String widgetId = param.getRefWidgetId() != null ?
                CompileUtil.generateWidgetId(p.getScope(PageScope.class).getPageId(), param.getRefWidgetId()) :
                defaultClientWidgetId;
        PageScope pageScope = p.getScope(PageScope.class);
        String datasource = pageScope == null ? widgetId : pageScope.getWidgetIdDatasourceMap().get(widgetId);
        ModelLink link = new ModelLink(p.cast(param.getRefModel(), defaultModel), datasource);
        link.setValue(p.resolveJS(param.getValue()));
        return link;
    }

    /**
     * Получение идентификатора клиентского виджета по умолчанию
     *
     * @param widgetScope Информация о виджете
     * @param p           Процессор сборки метаданных
     * @return Идентификатор клиентского виджета по умолчанию
     */
    private String getDefaultClientWidgetId(WidgetScope widgetScope, CompileProcessor p) {
        String widgetIdByComponentScope = getWidgetIdByComponentScope(p);
        return widgetIdByComponentScope != null ? widgetIdByComponentScope : widgetScope.getClientWidgetId();
    }
}

package net.n2oapp.framework.config.metadata.compile.widget;

import net.n2oapp.framework.api.metadata.Source;
import net.n2oapp.framework.api.metadata.compile.CompileContext;
import net.n2oapp.framework.api.metadata.compile.CompileProcessor;
import net.n2oapp.framework.api.metadata.global.view.widget.N2oCustomWidget;
import net.n2oapp.framework.api.metadata.local.CompiledObject;
import net.n2oapp.framework.api.metadata.meta.widget.CustomWidget;
import net.n2oapp.framework.config.metadata.compile.PageRoutesScope;
import net.n2oapp.framework.config.metadata.compile.ParentRouteScope;
import org.springframework.stereotype.Component;

@Component
public class CustomWidgetCompiler extends BaseWidgetCompiler<CustomWidget, N2oCustomWidget> {
    @Override
    public Class<? extends Source> getSourceClass() {
        return N2oCustomWidget.class;
    }

    @Override
    protected String getPropertyWidgetSrc() {
        return null;
    }

    @Override
    public CustomWidget compile(N2oCustomWidget source, CompileContext<?, ?> context, CompileProcessor p) {
        CustomWidget widget = new CustomWidget();
        CompiledObject object = getObject(source, p);
        compileWidget(widget, source, context, p, object);
        ParentRouteScope widgetRoute = initWidgetRouteScope(widget, context, p);
        PageRoutesScope pageRoutesScope = p.getScope(PageRoutesScope.class);
        if (pageRoutesScope != null) {
            pageRoutesScope.put(widget.getId(), widgetRoute);
        }
        compileDataProviderAndRoutes(widget, source, context, p, null, widgetRoute, null, null, object);
        WidgetScope widgetScope = new WidgetScope();
        widgetScope.setWidgetId(source.getId());
        widgetScope.setQueryId(source.getQueryId());
        widgetScope.setClientWidgetId(widget.getId());
        MetaActions widgetActions = initMetaActions(source);
        compileToolbarAndAction(widget, source, context, p, widgetScope, widgetRoute, widgetActions, object, null);
        return widget;
    }
}

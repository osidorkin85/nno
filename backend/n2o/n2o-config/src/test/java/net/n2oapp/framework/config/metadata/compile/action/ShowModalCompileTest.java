package net.n2oapp.framework.config.metadata.compile.action;

import net.n2oapp.criteria.dataset.DataSet;
import net.n2oapp.criteria.filters.FilterType;
import net.n2oapp.framework.api.metadata.ReduxModel;
import net.n2oapp.framework.api.metadata.event.action.UploadType;
import net.n2oapp.framework.api.metadata.global.dao.N2oQuery;
import net.n2oapp.framework.api.metadata.global.view.widget.toolbar.CopyMode;
import net.n2oapp.framework.api.metadata.local.CompiledObject;
import net.n2oapp.framework.api.metadata.local.CompiledQuery;
import net.n2oapp.framework.api.metadata.meta.Filter;
import net.n2oapp.framework.api.metadata.meta.action.close.CloseAction;
import net.n2oapp.framework.api.metadata.meta.action.copy.CopyAction;
import net.n2oapp.framework.api.metadata.meta.action.invoke.InvokeAction;
import net.n2oapp.framework.api.metadata.meta.action.invoke.InvokeActionPayload;
import net.n2oapp.framework.api.metadata.meta.action.modal.show_modal.ShowModal;
import net.n2oapp.framework.api.metadata.meta.action.modal.show_modal.ShowModalPayload;
import net.n2oapp.framework.api.metadata.meta.page.Page;
import net.n2oapp.framework.api.metadata.meta.page.SimplePage;
import net.n2oapp.framework.api.metadata.meta.page.StandardPage;
import net.n2oapp.framework.api.metadata.meta.saga.AsyncMetaSaga;
import net.n2oapp.framework.api.metadata.meta.saga.MetaSaga;
import net.n2oapp.framework.api.metadata.meta.saga.RefreshSaga;
import net.n2oapp.framework.api.metadata.meta.widget.RequestMethod;
import net.n2oapp.framework.api.metadata.meta.widget.Widget;
import net.n2oapp.framework.api.metadata.meta.widget.form.Form;
import net.n2oapp.framework.api.metadata.meta.widget.table.Table;
import net.n2oapp.framework.api.metadata.meta.widget.toolbar.AbstractButton;
import net.n2oapp.framework.config.N2oApplicationBuilder;
import net.n2oapp.framework.config.metadata.compile.context.ActionContext;
import net.n2oapp.framework.config.metadata.compile.context.PageContext;
import net.n2oapp.framework.config.metadata.compile.context.QueryContext;
import net.n2oapp.framework.config.metadata.pack.*;
import net.n2oapp.framework.config.selective.CompileInfo;
import net.n2oapp.framework.config.test.SourceCompileTestBase;
import org.junit.Before;
import org.junit.Test;

import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

/**
 * Тестирование компиляции действия открытия модального окна
 */
public class ShowModalCompileTest extends SourceCompileTestBase {

    @Override
    @Before
    public void setUp() throws Exception {
        super.setUp();
    }

    @Override
    protected void configure(N2oApplicationBuilder builder) {
        super.configure(builder);
        builder.packs(new N2oPagesPack(), new N2oRegionsPack(), new N2oWidgetsPack(), new N2oControlsPack(), new N2oAllDataPack(),
                new N2oActionsPack(), new N2oCellsPack());
        builder.sources(new CompileInfo("net/n2oapp/framework/config/metadata/compile/action/testShowModalPage.page.xml"),
                new CompileInfo("net/n2oapp/framework/config/metadata/compile/action/testShowModalPageSecondFlow.page.xml"),
                new CompileInfo("net/n2oapp/framework/config/metadata/compile/action/testShowModalPage2.page.xml"),
                new CompileInfo("net/n2oapp/framework/config/metadata/compile/action/testShowModalPage3.page.xml"),
                new CompileInfo("net/n2oapp/framework/config/metadata/compile/action/testShowModal.object.xml"),
                new CompileInfo("net/n2oapp/framework/config/metadata/compile/action/testShowModal.query.xml"),
                new CompileInfo("net/n2oapp/framework/config/metadata/compile/action/testOpenPageDynamicPage.query.xml"),
                new CompileInfo("net/n2oapp/framework/config/metadata/compile/action/testShowModal.object.xml"),
                new CompileInfo("net/n2oapp/framework/config/metadata/compile/action/testOpenPageSimplePageAction1.page.xml"),
                new CompileInfo("net/n2oapp/framework/config/metadata/compile/action/testShowModalPageByParams.page.xml"),
                new CompileInfo("net/n2oapp/framework/config/metadata/compile/action/testOpenPageSimplePageAction2.page.xml"),
                new CompileInfo("net/n2oapp/framework/config/metadata/compile/action/testShowModalCopyActionWithTwoWidgetPage.page.xml")
        );
    }

    @Test
    public void create() {
        PageContext pageContext = new PageContext("testShowModalRootPage", "/p");
        StandardPage rootPage = (StandardPage) compile("net/n2oapp/framework/config/metadata/compile/action/testShowModalRootPage.page.xml")
                .get(pageContext);

        Table table = (Table) rootPage.getRegions().get("left").get(0).getContent().get(0);
        ShowModalPayload payload = ((ShowModal) table.getToolbar().getButton("create").getAction()).getPayload();
        //create
        assertThat(payload.getPageUrl(), is("/p/create"));
        assertThat(payload.getSize(), is("sm"));
        assertThat(payload.getScrollable(), is(true));
        assertThat(payload.getPageId(), is("p_create"));
        assertThat(payload.getPrompt(), is(true));

        assertThat(payload.getHasHeader(), is(false));
        assertThat(payload.getBackdrop(), is(true));
        assertThat(payload.getClassName(), is("n2o-custom-modal-dialog"));
        assertThat(payload.getStyle().get("background"), is("red"));

//        assertThat(payload.getActions().size(), is(2));
//        assertThat(payload.getActions().containsKey("submit"), is(true));
//        assertThat(payload.getActions().containsKey("close"), is(true));

//        List<Button> buttons = payload.getToolbar().get(0).getButtons();
//        assertThat(buttons.get(0).getId(), is("submit"));
//        assertThat(buttons.get(0).getActionId(), is("submit"));
//        assertThat(buttons.get(1).getId(), is("close"));
//        assertThat(buttons.get(1).getActionId(), is("close"));

//        InvokeAction submit = (InvokeAction) payload.getActions().get("submit");
//        InvokeActionPayload submitPayload = submit.getOptions().getPayload();
//        assertThat(submitPayload.getDataProvider().getUrl(), is("n2o/data/p/main/create/submit"));
//        assertThat(submitPayload.getModelLink(), is("models.resolve['p_main_create_main']"));

        PageContext modalContext = (PageContext) route("/p/create", Page.class);
        assertThat(modalContext.getSourceId(null), is("testShowModalPage"));
        assertThat(modalContext.getUpload(), is(UploadType.defaults));
        SimplePage modalPage = (SimplePage) read().compile().get(modalContext);
        assertThat(modalPage.getId(), is("p_create"));
        assertThat(modalPage.getBreadcrumb(), nullValue());

        assertThat(modalPage.getToolbar().getButton("submit"), notNullValue());
        assertThat(modalPage.getToolbar().getButton("close"), notNullValue());

        Widget modalWidget = modalPage.getWidget();
        assertThat(modalWidget.getUpload(), is(UploadType.defaults));

        List<AbstractButton> buttons = modalPage.getToolbar().get("bottomRight").get(0).getButtons();
        assertThat(buttons.size(), is(2));
        assertThat(buttons.get(0).getId(), is("submit"));
        assertThat(buttons.get(0).getAction(), notNullValue());
        assertThat(buttons.get(1).getId(), is("close"));
        assertThat(buttons.get(1).getAction(), notNullValue());
//        assertThat(buttons.get(1).getLabel(), is("Закрыть"));

        InvokeAction submit = (InvokeAction) modalPage.getToolbar().getButton("submit").getAction();
        InvokeActionPayload submitPayload = submit.getPayload();
        assertThat(submitPayload.getDataProvider().getUrl(), is("n2o/data/p/create/submit"));
        assertThat(submitPayload.getDataProvider().getMethod(), is(RequestMethod.POST));
        assertThat(submitPayload.getModelLink(), is("models.edit['p_create_main']"));
        assertThat(submitPayload.getWidgetId(), is("p_create_main"));
        AsyncMetaSaga meta = submit.getMeta();
        assertThat(meta.getSuccess().getRefresh().getOptions().getWidgetId(), is("p_second"));
        assertThat(meta.getSuccess().getModalsToClose(), is(1));
        assertThat(meta.getFail().getMessageWidgetId(), is("p_create_main"));
        assertThat(meta.getSuccess().getMessageWidgetId(), is("p_main"));
//        assertThat(meta.getRedirect().getPath(), is("/p/main/:id"));
//        assertThat(meta.getRedirect().getTarget(), is(Target.application));
        assertThat(submit.getPayload().getDataProvider().getUrl(), is("n2o/data/p/create/submit"));

        ActionContext submitContext = (ActionContext) route("/p/create/submit", CompiledObject.class);
        assertThat(submitContext.getSourceId(null), is("testShowModal"));
        assertThat(submitContext.getOperationId(), is("create"));
//        assertThat(submitContext.getRedirectUrl(), is("/p/main/:id"));
    }

    @Test
    public void update() {
        PageContext pageContext = new PageContext("testShowModalRootPage", "/p");
        StandardPage rootPage = (StandardPage) compile("net/n2oapp/framework/config/metadata/compile/action/testShowModalRootPage.page.xml")
                .get(pageContext);

        Table table = (Table) rootPage.getRegions().get("left").get(0).getContent().get(0);
        ShowModalPayload payload = ((ShowModal) table.getToolbar().getButton("update").getAction()).getPayload();

        //update
        assertThat(payload.getPageUrl(), is("/p/:id/update"));
//        assertThat(payload.getTitle(), is("Модальное окно"));
        assertThat(payload.getSize(), is("lg"));
        assertThat(payload.getPrompt(), is(false));
        assertThat(payload.getHasHeader(), is(true));
        assertThat(payload.getBackdrop(), is("static"));

        PageContext modalContext = (PageContext) route("/p/123/update", Page.class);
        assertThat(modalContext.getSourceId(null), is("testShowModalPageSecondFlow"));
        assertThat(modalContext.getPreFilters().size(), is(1));
        assertThat(modalContext.getPreFilters().get(0).getRefWidgetId(), is("main"));
        assertThat(modalContext.getPreFilters().get(0).getRefPageId(), is("p"));
        assertThat(modalContext.getPreFilters().get(0).getFieldId(), is(N2oQuery.Field.PK));
        assertThat(modalContext.getPreFilters().get(0).getType(), is(FilterType.eq));
        assertThat(modalContext.getPreFilters().get(0).getRefModel(), is(ReduxModel.RESOLVE));
        assertThat(modalContext.getPreFilters().get(0).getValue(), is("{secondId}"));
        assertThat(modalContext.getUpload(), is(UploadType.query));
        SimplePage modalPage = (SimplePage) read().compile().get(modalContext);
        assertThat(modalPage.getId(), is("p_update"));
        assertThat(modalPage.getBreadcrumb(), nullValue());
        Widget modalWidget = modalPage.getWidget();
        List<Filter> filters = modalWidget.getFilters();
        assertThat(filters.get(0).getParam(), is("id"));
        assertThat(filters.get(0).getFilterId(), is("id"));
        assertThat(filters.get(0).getRoutable(), is(false));
        assertThat(filters.get(0).getLink().getBindLink(), is("models.resolve['p_main']"));
        assertThat(filters.get(0).getLink().getValue(), is("`secondId`"));
        assertThat(modalWidget.getDataProvider().getQueryMapping().size(), is(0));
        assertThat(modalWidget.getDataProvider().getPathMapping().get("id").getBindLink(), is("models.resolve['p_main']"));
        assertThat(modalWidget.getDataProvider().getPathMapping().get("id").getValue(), is("`id`"));
        assertThat(modalWidget.getUpload(), is(UploadType.query));
//        List<AbstractButton> buttons = modalPage.getWidget().getToolbar().get("bottomRight").get(0).getButtons();
//        assertThat(buttons.size(), is(2));
//        assertThat(buttons.get(0).getId(), is("submit"));
//        assertThat(buttons.get(0).getAction(), notNullValue());
//        assertThat(buttons.get(0).getLabel(), is("Сохранить"));
//        assertThat(buttons.get(1).getId(), is("close"));
//        assertThat(buttons.get(1).getAction(), notNullValue());
//        assertThat(buttons.get(1).getLabel(), is("Закрыть"));
//        InvokeAction submit = (InvokeAction) modalPage.getWidget().getActions().get("submit");
//        assertThat(submit.getMeta().getSuccess().getRefresh().getOptions().getWidgetId(), is("p_main"));
//        assertThat(submit.getMeta().getSuccess().getModalsToClose(), is(1));
//        assertThat(submit.getPayload().getDataProvider().getUrl(), is("n2o/data/p/:id/update/submit"));
//        ActionContext submitContext = (ActionContext) route("/p/:id/update/submit", CompiledObject.class);
//        assertThat(submitContext.getSourceId(null), is("testShowModal"));
//        assertThat(submitContext.getOperationId(), is("update"));
//        assertThat(submitContext.getOperationId(), is("update"));

        DataSet data = new DataSet();
        data.put("id", 222);
        modalPage = (SimplePage) read().compile().bind().get(modalContext, data);
        ShowModal showModal = (ShowModal) modalPage.getWidget().getToolbar().getButton("menuItem0").getAction();
        assertThat(showModal.getPayload().getPageUrl(), is("/p/222/update/menuItem0"));
        assertThat(modalPage.getWidget().getDataProvider().getUrl(), is("n2o/data/p/222/update"));
//        submit = (InvokeAction) modalPage.getWidget().getActions().get("submit");
//        assertThat(submit.getPayload().getDataProvider().getPathMapping(), not(hasKey("p_main_id")));// :p_main_id заменяется на этапе биндинга

        QueryContext queryContext = (QueryContext) route("/p/123/update", CompiledQuery.class);
        assertThat(queryContext.getValidations().size(), is(1));
    }

    @Test
    public void createFocus() {
        PageContext pageContext = new PageContext("testShowModalRootPage", "/p");
        StandardPage rootPage = (StandardPage) compile("net/n2oapp/framework/config/metadata/compile/action/testShowModalRootPage.page.xml")
                .get(pageContext);
        SimplePage showModal = (SimplePage) routeAndGet("/p/createFocus", Page.class);
        InvokeAction submit = (InvokeAction) showModal.getToolbar().getButton("submit").getAction();
        assertThat(submit.getMeta().getSuccess().getModalsToClose(), is(1));
        assertThat(submit.getMeta().getSuccess().getRedirect().getPath(), is("/p/:id"));
        assertThat(submit.getMeta().getSuccess().getRefresh().getOptions().getWidgetId(), is("p_main"));

        CloseAction close = (CloseAction) showModal.getToolbar().getButton("close").getAction();
        assertThat(close.getMeta().getRedirect(), nullValue());
        assertThat(close.getMeta().getRefresh(), nullValue());
    }

    @Test
    public void updateFocus() {
        PageContext pageContext = new PageContext("testShowModalRootPage", "/p");
        compile("net/n2oapp/framework/config/metadata/compile/action/testShowModalRootPage.page.xml")
                .get(pageContext);
        StandardPage showModal = (StandardPage) routeAndGet("/p/123/updateFocus", Page.class);
        InvokeAction submit = (InvokeAction) showModal.getToolbar().getButton("submit").getAction();
        assertThat(submit.getMeta().getSuccess().getModalsToClose(), is(1));
        assertThat(submit.getMeta().getSuccess().getRedirect().getPath(), is("/p/:id"));
        assertThat(submit.getMeta().getSuccess().getRefresh().getOptions().getWidgetId(), is("p_main"));

        CloseAction close = (CloseAction) showModal.getToolbar().getButton("close").getAction();
        assertThat(close.getMeta().getRedirect(), nullValue());
        assertThat(close.getMeta().getRefresh(), nullValue());
        Widget modalWidget = (Widget) showModal.getRegions().get("left").get(0).getContent().get(0);
        assertThat(modalWidget.getDataProvider().getPathMapping().size(), is(0));
        assertThat(modalWidget.getDataProvider().getQueryMapping().size(), is(0));
    }

    @Test
    public void updateWithoutMasterDetail() {
        PageContext pageContext = new PageContext("testShowModalRootPage", "/p");
        compile("net/n2oapp/framework/config/metadata/compile/action/testShowModalRootPage.page.xml")
                .get(pageContext);
        StandardPage showModal = (StandardPage) routeAndGet("/p/123/updateByPathParams", Page.class);
        InvokeAction submit = (InvokeAction) showModal.getToolbar().getButton("submit").getAction();
        assertThat(submit.getMeta().getSuccess().getModalsToClose(), is(1));
        assertThat(submit.getMeta().getSuccess().getRedirect().getPath(), is("/p/:id"));
        assertThat(submit.getMeta().getSuccess().getRefresh().getOptions().getWidgetId(), is("p_main"));

        CloseAction close = (CloseAction) showModal.getToolbar().getButton("close").getAction();
        assertThat(close.getMeta().getRedirect(), nullValue());
        assertThat(close.getMeta().getRefresh(), nullValue());
        Widget modalWidget = (Widget) showModal.getRegions().get("left").get(0).getContent().get(0);
        assertThat(modalWidget.getDataProvider().getPathMapping().size(), is(0));
        assertThat(modalWidget.getDataProvider().getQueryMapping().size(), is(0));
    }

    @Test
    public void createUpdate() {
        PageContext pageContext = new PageContext("testShowModalRootPage", "/p");
        Page rootPage = compile("net/n2oapp/framework/config/metadata/compile/action/testShowModalRootPage.page.xml")
                .get(pageContext);
        SimplePage showModal = (SimplePage) routeAndGet("/p/createUpdate", Page.class);
        InvokeAction submit = (InvokeAction) showModal.getToolbar().getButton("submit").getAction();
        assertThat(submit.getMeta().getSuccess().getModalsToClose(), is(1));
        assertThat(submit.getMeta().getSuccess().getRedirect().getPath(), is("/p/:id/update"));
        //Есть обновление, потому что по умолчанию true. Обновится родительский виджет, потому что close-after-submit=true
        assertThat(submit.getMeta().getSuccess().getRefresh().getOptions().getWidgetId(), is("p_main"));
        //Есть уведомление, потому что по умолчанию true. Уведомление будет на родительском виджете, потому что close-after-submit=true

        CloseAction close = (CloseAction) showModal.getToolbar().getButton("close").getAction();
        assertThat(close.getMeta().getRedirect(), nullValue());
        assertThat(close.getMeta().getRefresh(), nullValue());
    }

    @Test
    public void dynamicPage() {
        Page page = compile("net/n2oapp/framework/config/metadata/compile/action/testShowModalDynamicPage.page.xml")
                .get(new PageContext("testShowModalDynamicPage", "/page"));
        PageContext context = (PageContext) route("/page/widget/testOpenPageSimplePageAction1/id1", Page.class);
        DataSet data = new DataSet();
        data.put("page_test_id", "testOpenPageSimplePageAction1");
        SimplePage showModal = (SimplePage) read().compile().bind().get(context, data);
        assertThat(showModal.getId(), is("page_widget_id1"));
        assertThat(showModal.getWidget(), instanceOf(Form.class));

        context = (PageContext) route("/page/widget/testOpenPageSimplePageAction2/id1", Page.class);
        data = new DataSet();
        data.put("page_test_id", "testOpenPageSimplePageAction2");
        showModal = (SimplePage) read().compile().bind().get(context, data);
        assertThat(showModal.getId(), is("page_widget_id1"));
        assertThat(showModal.getWidget(), instanceOf(Form.class));
    }

    @Test
    public void updateWithPreFilters() {
        PageContext pageContext = new PageContext("testShowModalRootPage", "/p");
        Page rootPage = compile("net/n2oapp/framework/config/metadata/compile/action/testShowModalRootPage.page.xml")
                .get(pageContext);

        PageContext modalContext = (PageContext) route("/p/123/updateWithPrefilters", Page.class);
        assertThat(modalContext.getSourceId(null), is("testShowModalPage"));
        assertThat(modalContext.getPreFilters().size(), is(1));
        assertThat(modalContext.getPreFilters().get(0).getRefWidgetId(), is("main"));
        assertThat(modalContext.getPreFilters().get(0).getRefPageId(), is("p"));
        assertThat(modalContext.getPreFilters().get(0).getFieldId(), is(N2oQuery.Field.PK));
        assertThat(modalContext.getPreFilters().get(0).getType(), is(FilterType.eq));
        assertThat(modalContext.getPreFilters().get(0).getRefModel(), is(ReduxModel.RESOLVE));
        assertThat(modalContext.getPreFilters().get(0).getValue(), is("{id}"));
        assertThat(modalContext.getUpload(), is(UploadType.query));

        SimplePage modalPage = (SimplePage) read().compile().get(modalContext);
        assertThat(modalPage.getId(), is("p_updateWithPrefilters"));
        assertThat(modalPage.getBreadcrumb(), nullValue());
        Widget modalWidget = modalPage.getWidget();
        List<Filter> filters = modalWidget.getFilters();
        assertThat(filters.get(2).getParam(), is("id"));
        assertThat(filters.get(2).getFilterId(), is("id"));
        assertThat(filters.get(2).getRoutable(), is(false));
        assertThat(filters.get(2).getLink().getBindLink(), is("models.resolve['p_main']"));
        assertThat(filters.get(2).getLink().getValue(), is("`id`"));
        assertThat(filters.get(0).getParam(), is("p_updateWithPrefilters_main_secondId"));
        assertThat(filters.get(0).getFilterId(), is("secondId"));
        assertThat(filters.get(0).getRoutable(), is(false));
        assertThat(filters.get(0).getLink().getBindLink(), nullValue());
        assertThat(filters.get(0).getLink().getValue(), is(1));
        assertThat(filters.get(1).getParam(), is("name"));
        assertThat(filters.get(1).getFilterId(), is("name"));
        assertThat(filters.get(1).getRoutable(), is(false));
        assertThat(filters.get(1).getLink().getBindLink(), is("models.filter['p_second']"));
        assertThat(filters.get(1).getLink().getValue(), is("`name`"));

        assertThat(modalWidget.getDataProvider().getPathMapping().get("id").getBindLink(), is("models.resolve['p_main']"));
        assertThat(modalWidget.getDataProvider().getPathMapping().get("id").getValue(), is("`id`"));
        assertThat(modalWidget.getDataProvider().getQueryMapping().get("name").getBindLink(), is("models.filter['p_second']"));
        assertThat(modalWidget.getDataProvider().getQueryMapping().get("name").getValue(), is("`name`"));

        assertThat(modalWidget.getUpload(), is(UploadType.query));
        List<AbstractButton> buttons = modalPage.getToolbar().get("bottomRight").get(0).getButtons();
        assertThat(buttons.size(), is(2));
        assertThat(buttons.get(0).getId(), is("submit"));
        assertThat(buttons.get(0).getAction(), notNullValue());
//        assertThat(buttons.get(0).getLabel(), is("Сохранить"));
        assertThat(buttons.get(1).getId(), is("close"));
        assertThat(buttons.get(1).getAction(), notNullValue());
//        assertThat(buttons.get(1).getLabel(), is("Закрыть"));
        InvokeAction submit = (InvokeAction) modalPage.getToolbar().getButton("submit").getAction();
        assertThat(submit.getMeta().getSuccess().getRefresh().getOptions().getWidgetId(), is("p_main"));
        assertThat(submit.getMeta().getSuccess().getModalsToClose(), is(1));
        assertThat(submit.getPayload().getDataProvider().getUrl(), is("n2o/data/p/:id/updateWithPrefilters/submit"));
        ActionContext submitContext = (ActionContext) route("/p/:id/updateWithPrefilters/submit", CompiledObject.class);
        assertThat(submitContext.getSourceId(null), is("testShowModal"));
        assertThat(submitContext.getOperationId(), is("update"));
        assertThat(submitContext.getOperationId(), is("update"));

        DataSet data = new DataSet();
        data.put("id", 222);
        modalPage = (SimplePage) read().compile().bind().get(modalContext, data);
        assertThat(modalPage.getWidget().getDataProvider().getUrl(), is("n2o/data/p/222/updateWithPrefilters"));
        submit = (InvokeAction) modalPage.getToolbar().getButton("submit").getAction();
        assertThat(submit.getPayload().getDataProvider().getPathMapping(), not(hasKey("p_main_id")));
    }

    @Test
    public void updateModelEditWithPreFilters() {
        PageContext pageContext = new PageContext("testShowModalRootPage", "/p");
        StandardPage rootPage = (StandardPage) compile("net/n2oapp/framework/config/metadata/compile/action/testShowModalRootPage.page.xml")
                .get(pageContext);
        ShowModal showModal = (ShowModal) ((Widget) rootPage.getRegions().get("left").get(0).getContent().get(0))
                .getToolbar().getButton("updateEditWithPrefilters").getAction();
        assertThat(showModal.getPayload().getQueryMapping().get("id").getBindLink(), is("models.edit['p_main']"));

        Page showModalPage = routeAndGet("/p/updateEditWithPrefilters", Page.class);
        assertThat(showModalPage.getId(), is("p_updateEditWithPrefilters"));
    }

    @Test
    public void copyAction() {
        Page rootPage = compile("net/n2oapp/framework/config/metadata/compile/action/testShowModalCopyAction.page.xml")
                .get(new PageContext("testShowModalCopyAction"));

        PageContext modalContext = (PageContext) route("/testShowModalCopyAction/123/update", Page.class);
        SimplePage modalPage = (SimplePage) read().compile().get(modalContext);

        CopyAction submit = (CopyAction) modalPage.getToolbar().getButton("submit").getAction();
        assertThat(submit.getType(), is("n2o/models/COPY"));
        assertThat(submit.getPayload().getSource().getPrefix(), is(ReduxModel.RESOLVE.getId()));
        assertThat(submit.getPayload().getSource().getKey(), is("testShowModalCopyAction_update_main"));
        assertThat(submit.getPayload().getSource().getField(), nullValue());
        assertThat(submit.getPayload().getTarget().getPrefix(), is(ReduxModel.EDIT.getId()));
        assertThat(submit.getPayload().getTarget().getKey(), is("testShowModalCopyAction_table1"));
        assertThat(submit.getPayload().getTarget().getField(), is("dictionary.id"));
        assertThat(submit.getPayload().getMode(), is(CopyMode.replace));
        assertThat(submit.getMeta().getModalsToClose(), is(1));

        List<AbstractButton> buttons = modalPage.getToolbar().get("bottomRight").get(0).getButtons();
        assertThat(buttons.get(0).getId(), is("submit"));
        assertThat(buttons.get(0).getAction(), is(submit));
    }

    @Test
    public void copyActionWithTwoWidget() {
        Page rootPage = compile("net/n2oapp/framework/config/metadata/compile/action/testShowModalCopyActionWithTwoWidget.page.xml")
                .get(new PageContext("testShowModalCopyActionWithTwoWidget"));

        PageContext modalContext = (PageContext) route("/testShowModalCopyActionWithTwoWidget/123/update", Page.class);
        StandardPage modalPage = (StandardPage) read().compile().get(modalContext);

        CopyAction submit = (CopyAction) modalPage.getToolbar().getButton("submit").getAction();
        assertThat(submit.getType(), is("n2o/models/COPY"));
        assertThat(submit.getPayload().getSource().getPrefix(), is(ReduxModel.MULTI.getId()));
        assertThat(submit.getPayload().getSource().getKey(), is("testShowModalCopyActionWithTwoWidget_update_table2"));
        assertThat(submit.getPayload().getSource().getField(), is("id"));
        assertThat(submit.getPayload().getTarget().getPrefix(), is(ReduxModel.MULTI.getId()));
        assertThat(submit.getPayload().getTarget().getKey(), is("testShowModalCopyActionWithTwoWidget_table1"));
        assertThat(submit.getPayload().getTarget().getField(), is("dictionary.id"));
        assertThat(submit.getPayload().getMode(), is(CopyMode.replace));
        assertThat(submit.getMeta().getModalsToClose(), is(1));

        List<AbstractButton> buttons = modalPage.getToolbar().get("bottomRight").get(0).getButtons();
        assertThat(buttons.get(0).getId(), is("submit"));
        assertThat(buttons.get(0).getAction(), is(submit));
    }

    @Test
    public void copyActionWithTwoWidgetWithoutCopyAttributes() {
        Page rootPage = compile("net/n2oapp/framework/config/metadata/compile/action/testShowModalCopyActionWithTwoWidgetDefault.page.xml")
                .get(new PageContext("testShowModalCopyActionWithTwoWidgetDefault"));

        PageContext modalContext = (PageContext) route("/testShowModalCopyActionWithTwoWidgetDefault/123/update", Page.class);
        StandardPage modalPage = (StandardPage) read().compile().get(modalContext);

        CopyAction submit = (CopyAction) modalPage.getToolbar().getButton("submit").getAction();
        assertThat(submit.getType(), is("n2o/models/COPY"));
        assertThat(submit.getPayload().getSource().getPrefix(), is(ReduxModel.RESOLVE.getId()));
        assertThat(submit.getPayload().getSource().getKey(), is("testShowModalCopyActionWithTwoWidgetDefault_update_master"));
        assertThat(submit.getPayload().getSource().getField(), nullValue());
        assertThat(submit.getPayload().getTarget().getPrefix(), is(ReduxModel.EDIT.getId()));
        assertThat(submit.getPayload().getTarget().getKey(), is("testShowModalCopyActionWithTwoWidgetDefault_ignore_table"));
        assertThat(submit.getPayload().getTarget().getField(), is("dictionary.id"));
        assertThat(submit.getPayload().getMode(), is(CopyMode.replace));
        assertThat(submit.getMeta().getModalsToClose(), is(1));

        List<AbstractButton> buttons = modalPage.getToolbar().get("bottomRight").get(0).getButtons();
        assertThat(buttons.get(0).getId(), is("submit"));
        assertThat(buttons.get(0).getAction(), is(submit));
        assertThat(buttons.get(0).getLabel(), is("Выбрать"));
    }

    @Test
    public void testShowModalOnClose() {
        PageContext pageContext = new PageContext("testShowModalOnClose", "/p");
        StandardPage rootPage = (StandardPage) compile("net/n2oapp/framework/config/metadata/compile/action/testShowModalOnClose.page.xml")
                .get(pageContext);

        MetaSaga meta = ((ShowModal) ((Form) rootPage.getRegions().get("single").get(0).getContent().get(0))
                .getToolbar().getButton("modal1").getAction()).getMeta();
        assertThat(meta.getOnClose(), notNullValue());
        assertThat(meta.getOnClose().getRefresh().getType(), is(RefreshSaga.Type.widget));
        assertThat(meta.getOnClose().getRefresh().getOptions().getWidgetId(), is("p_form"));

        meta = ((ShowModal) ((Form) rootPage.getRegions().get("single").get(0).getContent().get(1))
                .getToolbar().getButton("modal2").getAction()).getMeta();
        assertThat(meta.getOnClose(), notNullValue());
        assertThat(meta.getOnClose().getRefresh().getType(), is(RefreshSaga.Type.widget));
        // defined by refresh-widget-id
        assertThat(meta.getOnClose().getRefresh().getOptions().getWidgetId(), is("p_form"));
    }
}
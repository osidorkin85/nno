package net.n2oapp.framework.config.metadata.compile.action;

import net.n2oapp.framework.api.metadata.meta.Page;
import net.n2oapp.framework.api.metadata.meta.action.clear.ClearAction;
import net.n2oapp.framework.config.N2oApplicationBuilder;
import net.n2oapp.framework.config.io.action.ClearActionElementIOV1;
import net.n2oapp.framework.config.metadata.compile.context.ModalPageContext;
import net.n2oapp.framework.config.metadata.pack.N2oPagesPack;
import net.n2oapp.framework.config.metadata.pack.N2oRegionsPack;
import net.n2oapp.framework.config.metadata.pack.N2oWidgetsPack;
import net.n2oapp.framework.config.test.SourceCompileTestBase;
import org.junit.Before;
import org.junit.Test;


import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

public class ClearActionCompileTest extends SourceCompileTestBase {

    @Override
    @Before
    public void setUp() throws Exception {
        super.setUp();
    }

    @Override
    protected void configure(N2oApplicationBuilder builder) {
        super.configure(builder);
        builder.packs(new N2oPagesPack(), new N2oRegionsPack(), new N2oWidgetsPack());
        builder.ios(new ClearActionElementIOV1());
        builder.compilers(new ClearActionCompiler());
    }

    @Test
    public void clearActionTest() {
        Page page = compile("net/n2oapp/framework/config/metadata/compile/action/testClearAction.page.xml")
                .get(new ModalPageContext("testClearAction", "/p/w/a"), null);
        ClearAction testAction =  (ClearAction)page.getWidgets().get("p_w_a_main").getActions().get("test");
        assertThat(testAction.getSrc(), is("perform"));
        assertThat(testAction.getOptions().getType(), is("n2o/models/CLEAR"));
        assertThat(testAction.getOptions().getPayload().getKey(), is("p_w_a_main"));
        assertThat(testAction.getOptions().getPayload().getPrefixes()[0], is("edit"));
        assertThat(testAction.getOptions().getPayload().getPrefixes()[1], is("resolve"));
    }

}

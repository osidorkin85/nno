package net.n2oapp.framework.access.metadata.transform;

import net.n2oapp.framework.access.integration.metadata.transform.TableAccessTransformer;
import net.n2oapp.framework.access.metadata.Security;
import net.n2oapp.framework.access.metadata.pack.AccessSchemaPack;
import net.n2oapp.framework.api.metadata.meta.Page;
import net.n2oapp.framework.api.metadata.meta.widget.table.TableWidgetComponent;
import net.n2oapp.framework.api.metadata.pipeline.ReadCompileTerminalPipeline;
import net.n2oapp.framework.config.N2oApplicationBuilder;
import net.n2oapp.framework.config.metadata.compile.context.PageContext;
import net.n2oapp.framework.config.metadata.pack.N2oAllDataPack;
import net.n2oapp.framework.config.metadata.pack.N2oAllPagesPack;
import net.n2oapp.framework.config.selective.CompileInfo;
import net.n2oapp.framework.config.test.SimplePropertyResolver;
import net.n2oapp.framework.config.test.SourceCompileTestBase;
import org.junit.Before;
import org.junit.Test;

import static net.n2oapp.framework.access.metadata.Security.SECURITY_PROP_NAME;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

public class TableAccessTransformerTest extends SourceCompileTestBase {
    @Override
    @Before
    public void setUp() throws Exception {
        super.setUp();
    }

    @Override
    protected void configure(N2oApplicationBuilder builder) {
        super.configure(builder);
        builder.sources(new CompileInfo("net/n2oapp/framework/access/metadata/transform/testQuery.query.xml"),
                new CompileInfo("net/n2oapp/framework/access/metadata/transform/testObjectAccessTransformer.object.xml"))
                .packs(new AccessSchemaPack(), new N2oAllDataPack(), new N2oAllPagesPack());
    }

    @Test
    public void testTableRowsAccess() {
        ((SimplePropertyResolver) builder.getEnvironment().getSystemProperties()).setProperty("n2o.access.schema.id", "testRegion");

        ReadCompileTerminalPipeline pipeline = compile("net/n2oapp/framework/access/metadata/schema/testRegion.access.xml",
                "net/n2oapp/framework/access/metadata/transform/testTableAccessTransformer.page.xml");

        Page page = (Page) ((ReadCompileTerminalPipeline) pipeline.transform())
                .get(new PageContext("testTableAccessTransformer"), null);

        Security.SecurityObject securityObject = ((Security)((TableWidgetComponent) page.getWidgets()
                .get("testTableAccessTransformer_testTable").getComponent()).getRows().getProperties()
                .get(SECURITY_PROP_NAME)).getSecurityMap().get("object");

        assertThat(securityObject.getPermissions().size(), is(1));
        assertThat(securityObject.getPermissions().contains("permission"), is(true));
        assertThat(securityObject.getUsernames().contains("user"), is(true));
    }
}

package net.n2oapp.framework.config.metadata.pack;

import net.n2oapp.framework.api.pack.MetadataPack;
import net.n2oapp.framework.config.N2oApplicationBuilder;
import net.n2oapp.framework.config.io.action.*;
import net.n2oapp.framework.config.metadata.compile.action.*;
import net.n2oapp.framework.config.metadata.compile.cell.ActionCellBinder;
import net.n2oapp.framework.config.metadata.compile.cell.ToolbarCellBinder;
import net.n2oapp.framework.config.metadata.compile.control.CustomFieldBinder;

public class N2oActionsPack implements MetadataPack<N2oApplicationBuilder> {
    @Override
    public void build(N2oApplicationBuilder b) {
        b.ios(new InvokeActionElementIOV1(),
                new ShowModalElementIOV1(),
                new OpenPageElementIOV1(),
                new OpenDrawerElementIOV1(),
                new AnchorElementIOV1(),
                new CloseActionElementIOV1(),
                new SetValueElementIOV1(),
                new PerformElementIOv1(),
                new CopyActionElementIOV1(),
                new ClearActionElementIOV1(),
                new PrintActionElementIOV1(),
                new RefreshActionElementIOV1());
        b.compilers(new PerformCompiler(),
                new ShowModalCompiler(),
                new OpenDrawerCompiler(),
                new InvokeActionCompiler(),
                new CloseActionCompiler(),
                new RefreshActionCompiler(),
                new OpenPageCompiler(),
                new AnchorCompiler(),
                new ClearActionCompiler(),
                new CopyActionCompiler(),
                new SetValueActionCompiler(),
                new PrintActionCompiler());
        b.binders(new InvokeActionBinder(),
                new ReduxActionBinder(),
                new LinkActionBinder(),
                new ShowModalBinder(),
                new OpenDrawerBinder(),
                new PerformButtonBinder(),
                new ActionFieldBinder(),
                new CustomFieldBinder(),
                new ToolbarCellBinder(),
                new ActionCellBinder(),
                new SubMenuBinder(),
                new PrintActionBinder());
    }
}
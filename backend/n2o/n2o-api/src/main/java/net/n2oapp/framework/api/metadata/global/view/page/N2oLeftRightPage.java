package net.n2oapp.framework.api.metadata.global.view.page;

import lombok.Getter;
import lombok.Setter;
import net.n2oapp.framework.api.metadata.SourceComponent;
import net.n2oapp.framework.api.metadata.global.view.widget.N2oWidget;

import java.util.ArrayList;
import java.util.List;

import static net.n2oapp.framework.api.metadata.global.view.page.BasePageUtil.collectWidgets;

/**
 * Модель страницы с правыми и левыми регионами (left-right-page)
 */
@Getter
@Setter
public class N2oLeftRightPage extends N2oBasePage {
    private SourceComponent[] left;
    private String leftWidth;
    private SourceComponent[] right;
    private String rightWidth;

    @Override
    public List<N2oWidget> getContainers() {
        List<N2oWidget> containers = new ArrayList<>();
        collectWidgets(containers, left);
        collectWidgets(containers, right);
        return containers;
    }
}

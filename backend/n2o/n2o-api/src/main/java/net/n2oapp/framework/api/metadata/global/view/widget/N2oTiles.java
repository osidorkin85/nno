package net.n2oapp.framework.api.metadata.global.view.widget;

import lombok.Getter;
import lombok.Setter;
import net.n2oapp.framework.api.metadata.aware.IdAware;
import net.n2oapp.framework.api.metadata.control.N2oComponent;
import net.n2oapp.framework.api.metadata.global.view.widget.table.N2oPagination;
import net.n2oapp.framework.api.metadata.global.view.widget.table.column.cell.N2oCell;

/**
 * Исходная модель виджета Плитки
 */
@Getter
@Setter
public class N2oTiles extends N2oWidget {
    private Integer colsSm;
    private Integer colsMd;
    private Integer colsLg;
    private Integer height;
    private Integer width;
    private N2oPagination pagination;
    private Block[] content;

    @Getter
    @Setter
    public static class Block extends N2oComponent implements IdAware {
        private String id;
        private N2oCell component;
    }
}
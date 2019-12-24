package net.n2oapp.framework.api.metadata.meta.page;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import net.n2oapp.framework.api.metadata.meta.widget.Widget;

@Getter
@Setter
public class SimplePage extends Page {
    @JsonProperty
    private Widget widget;
}

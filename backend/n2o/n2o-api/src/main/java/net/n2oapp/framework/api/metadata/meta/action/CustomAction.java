package net.n2oapp.framework.api.metadata.meta.action;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import net.n2oapp.framework.api.metadata.meta.saga.MetaSaga;

import java.util.Map;

/**
 * Кастомизированное действие
 */
@Getter
@Setter
public class CustomAction extends AbstractAction<ActionPayload, MetaSaga> {

    @JsonProperty
    protected CustomOptions options;

    public CustomAction(Map<String, Object> options) {
        super(null, null);
        this.options = new CustomOptions(options);
    }
}

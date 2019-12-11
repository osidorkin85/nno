package net.n2oapp.framework.api.metadata.meta.control;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * Клиентская модель многострочного текстового поля
 */
@Getter
@Setter
public class TextArea extends Control {
    @JsonProperty("maxRows")
    private Integer rows;
    @JsonProperty
    private String placeholder;
}

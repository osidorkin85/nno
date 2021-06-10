package net.n2oapp.framework.config.metadata.compile.control;

import net.n2oapp.framework.api.data.DomainProcessor;
import net.n2oapp.framework.api.metadata.Source;
import net.n2oapp.framework.api.metadata.compile.CompileContext;
import net.n2oapp.framework.api.metadata.compile.CompileProcessor;
import net.n2oapp.framework.api.metadata.control.list.N2oRadioGroup;
import net.n2oapp.framework.api.metadata.meta.control.RadioGroup;
import net.n2oapp.framework.api.metadata.meta.control.StandardField;
import org.springframework.stereotype.Component;

import static net.n2oapp.framework.api.metadata.compile.building.Placeholders.property;

@Component
public class RadioGroupCompiler extends ListControlCompiler<RadioGroup, N2oRadioGroup> {

    @Override
    protected String getControlSrcProperty() {
        return "n2o.api.control.radiogroup.src";
    }

    @Override
    public Class<? extends Source> getSourceClass() {
        return N2oRadioGroup.class;
    }

    @Override
    public StandardField<RadioGroup> compile(N2oRadioGroup source, CompileContext<?, ?> context, CompileProcessor p) {
        RadioGroup radioGroup = new RadioGroup();
        radioGroup.setInline(p.cast(source.getInline() == null && source.getType() == N2oRadioGroup.RadioGroupType.tabs ? Boolean.TRUE : source.getInline(), p.resolve("n2o.api.control.alt.inline", Boolean.class)));
        radioGroup.setType(p.cast(source.getType() == N2oRadioGroup.RadioGroupType.n2o ? N2oRadioGroup.RadioGroupType.defaultType : source.getType(), new DomainProcessor().deserializeEnum(p.resolve(property("n2o.api.control.alt.type"), N2oRadioGroup.RadioGroupType.class), N2oRadioGroup.RadioGroupType.class)));
        radioGroup.setSize(p.cast(source.getSize(), p.resolve(property("n2o.api.control.list.size"), Integer.class)));
        StandardField<RadioGroup> result = compileListControl(radioGroup, source, context, p);
        return compileFetchDependencies(result, source, p);
    }
}

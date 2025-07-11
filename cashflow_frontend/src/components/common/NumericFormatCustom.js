import React from 'react';
import { NumericFormat } from 'react-number-format';

// Komponen ini kita jadikan komponen reusable
const NumericFormatCustom = React.forwardRef(function NumericFormatCustom(props, ref) {
    const { onChange, ...other } = props;

    return (
        <NumericFormat
            {...other}
            getInputRef={ref}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.value, // Mengirim nilai angka (unformatted)
                    },
                });
            }}
            thousandSeparator="."
            decimalSeparator=","
        />
    );
});

export default NumericFormatCustom;
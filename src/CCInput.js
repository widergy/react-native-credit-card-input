import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const s = StyleSheet.create({
  baseInputStyle: { color: "black" },
});

export default class CCInput extends Component {
  static propTypes = {
    field: PropTypes.string.isRequired,
    label: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    keyboardType: PropTypes.string,

    status: PropTypes.oneOf(["valid", "invalid", "incomplete"]),

    containerStyle: PropTypes.any,
    inputStyle: PropTypes.any,
    labelStyle: PropTypes.any,
    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    placeholderColor: PropTypes.string,

    onFocus: PropTypes.func,
    onChange: PropTypes.func,
    onBecomeEmpty: PropTypes.func,
    onBecomeValid: PropTypes.func,
    onSubmitEditing: PropTypes.func,
    cancelScrollOnValidNumber: PropTypes.bool,
    secureTextEntry: PropTypes.bool,
    isLast: PropTypes.bool,
    additionalInputProps: PropTypes.object,
  };

  static defaultProps = {
    label: "",
    value: "",
    status: "incomplete",
    containerStyle: {},
    inputStyle: {},
    labelStyle: {},
    onFocus: () => {},
    onChange: () => {},
    onBecomeEmpty: () => {},
    onBecomeValid: () => {},
    additionalInputProps: {},
  };

  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }

  componentWillReceiveProps = newProps => {
    const { status, value, onBecomeEmpty, onBecomeValid, field, cancelScrollOnValidNumber } = this.props;
    const { status: newStatus, value: newValue } = newProps;

    if (value !== "" && newValue === "") onBecomeEmpty(field);
    if (status !== "valid" && newStatus === "valid" && !cancelScrollOnValidNumber) onBecomeValid(field);
  };

  focus = () => {
    if (this.inputRef && this.inputRef.current && typeof this.inputRef.current.focus === "function") {
      this.inputRef.current.focus();
    }
  };

  _onFocus = () => this.props.onFocus(this.props.field);
  _onChange = value => this.props.onChange(this.props.field, value);
  _onSubmitEditing = value => this.props.onSubmitEditing(this.props.field, value);

  render() {
    const {
      label,
      value,
      placeholder,
      status,
      keyboardType,
      containerStyle,
      inputStyle,
      labelStyle,
      validColor,
      invalidColor,
      placeholderColor,
      additionalInputProps,
      secureTextEntry,
      isLast,
    } = this.props;
    let restAdditionalProps = {};
    let additionalStyle = undefined;
    if (additionalInputProps && typeof additionalInputProps === "object") {
      additionalStyle = additionalInputProps.style;
      restAdditionalProps = Object.keys(additionalInputProps).reduce((acc, key) => {
        if (key !== "ref" && key !== "style") {
          return { ...acc, [key]: additionalInputProps[key] };
        }
        return acc;
      }, {});
    }

    return (
      <TouchableOpacity onPress={this.focus} activeOpacity={0.99}>
        <View style={[containerStyle]}>
          {!!label && <Text style={[labelStyle]}>{label}</Text>}
          <TextInput
            {...restAdditionalProps}
            ref={this.inputRef}
            keyboardType={keyboardType}
            autoCapitalize="words"
            autoCorrect={false}
            secureTextEntry={secureTextEntry}
            returnKeyType={isLast ? "done" : "next"}
            style={[
              s.baseInputStyle,
              inputStyle,
              (validColor && status === "valid")
                ? { color: validColor }
                : (invalidColor && status === "invalid")
                ? { color: invalidColor }
                : {},
              additionalStyle,
            ]}
            underlineColorAndroid={"transparent"}
            placeholderTextColor={placeholderColor}
            placeholder={placeholder}
            value={value}
            onFocus={this._onFocus}
            onSubmitEditing={this._onSubmitEditing}
            onChangeText={this._onChange} />
        </View>
      </TouchableOpacity>
    );
  }
}

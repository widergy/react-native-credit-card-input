import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import ReactNative, {
  NativeModules,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  ViewPropTypes,
} from "react-native";

import CreditCard from "./CardView";
import CCInput from "./CCInput";
import { InjectedProps } from "./connectToState";

const COMMON_MARGIN = 15;

const s = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
  },
  form: {
    marginTop: 20,
  },
  inputLabel: {
    fontWeight: "bold",
  },
  input: {
    height: 40,
  },
  cardNumberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: COMMON_MARGIN,
  },
  cvcDuedateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: COMMON_MARGIN,
  },
  cardHolderNameContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
});

const CVC_INPUT_WIDTH = 70;
const EXPIRY_INPUT_WIDTH = CVC_INPUT_WIDTH;
const CARD_NUMBER_INPUT_WIDTH_OFFSET = 40;
const CARD_NUMBER_INPUT_WIDTH =
  Dimensions.get("window").width -
  EXPIRY_INPUT_WIDTH -
  CARD_NUMBER_INPUT_WIDTH_OFFSET;
const NAME_INPUT_WIDTH = CARD_NUMBER_INPUT_WIDTH;
const PREVIOUS_FIELD_OFFSET = 40;
const POSTAL_CODE_INPUT_WIDTH = 120; // https://github.com/yannickcr/eslint-plugin-react/issues/106

/* eslint react/prop-types: 0 */ export default class CreditCardInput extends Component {
  static propTypes = {
    ...InjectedProps,
    labels: PropTypes.object,
    placeholders: PropTypes.object,
    cardPlaceholders: PropTypes.object,

    labelStyle: Text.propTypes.style,
    inputStyle: Text.propTypes.style,
    inputContainerStyle: ViewPropTypes.style,
    containerStyle: ViewPropTypes.style,

    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    placeholderColor: PropTypes.string,

    cardImageFront: PropTypes.number,
    cardImageBack: PropTypes.number,
    cardScale: PropTypes.number,
    cardFontSize: PropTypes.number,
    cardFontFamily: PropTypes.string,
    cardBrandIcons: PropTypes.object,

    allowScroll: PropTypes.bool,

    additionalInputsProps: PropTypes.objectOf(
      PropTypes.shape(TextInput.propTypes)
      ),

    cardNumberInputWidth: PropTypes.number,
    expiryInputWidth: PropTypes.number,
    cvcInputWidth: PropTypes.number,
    nameInputWidth: PropTypes.number,
    postalCodeInputWidth: PropTypes.number,
    renderInputButton: PropTypes.func,
  };

  static defaultProps = {
    cardViewSize: {},
    labels: {
      name: "CARDHOLDER'S NAME",
      number: "CARD NUMBER",
      expiry: "EXPIRY",
      cvc: "CVC/CCV",
      postalCode: "POSTAL CODE",
    },
    cardFontSize: 21,
    placeholders: {
      name: "Full Name",
      number: "1234 5678 1234 5678",
      expiry: "MM/YY",
      cvc: "CVC",
      postalCode: "34567",
    },
    inputContainerStyle: {
      borderBottomWidth: 1,
      borderBottomColor: "black",
    },
    validColor: "",
    invalidColor: "red",
    placeholderColor: "gray",
    allowScroll: false,
    additionalInputsProps: {},
  };

  componentDidMount = () => this._focus(this.props.focused);

  componentWillReceiveProps = newProps => {
    if (this.props.focused !== newProps.focused) this._focus(newProps.focused);
  };

  _focus = field => {
    if (!field) return;

    const scrollResponder = this.refs.Form.getScrollResponder();
    const nodeHandle = ReactNative.findNodeHandle(this.refs[field]);

    NativeModules.UIManager.measureLayoutRelativeToParent(
      nodeHandle,
      e => {
        throw e;
      },
      x => {
        scrollResponder.scrollTo({
          x: Math.max(x - PREVIOUS_FIELD_OFFSET, 0),
          animated: true,
        });
        this.refs[field].focus();
      }
    );
  };

  _inputProps = field => {
    const {
      inputStyle,
      labelStyle,
      validColor,
      invalidColor,
      placeholderColor,
      placeholders,
      labels,
      values,
      status,
      onFocus,
      onChange,
      onBecomeEmpty,
      onBecomeValid,
      onSubmitEditing,
      additionalInputsProps,
    } = this.props;

    return {
      inputStyle: [s.input, inputStyle],
      labelStyle: [s.inputLabel, labelStyle],
      validColor,
      invalidColor,
      placeholderColor,
      ref: field,
      field,

      label: labels[field],
      placeholder: placeholders[field],
      value: values[field],
      status: status[field],

      onFocus,
      onChange,
      onBecomeEmpty,
      onBecomeValid,
      onSubmitEditing,

      additionalInputProps: additionalInputsProps[field],
    };
  };

  render() {
    const {
      cardImageFront,
      cardImageBack,
      inputContainerStyle,
      containerStyle,
      values: { number, expiry, cvc, name, type },
      focused,
      allowScroll,
      requiresName,
      requiresCVC,
      requiresPostalCode,
      cardScale,
      cardFontSize,
      cardFontFamily,
      cardBrandIcons,
      cardPlaceholders,
      hideCVC,
      cardNumberInputWidth,
      expiryInputWidth,
      cvcInputWidth,
      nameInputWidth,
      postalCodeInputWidth,
      renderInputButton,
      verticalFields,
      placeholders,
      cancelScrollOnValidNumber,
    } = this.props;

    const isAmex = type === "american-express";

    const cardNumberInput = (
      <Fragment>
        <CCInput
          {...this._inputProps("number")}
          cancelScrollOnValidNumber={cancelScrollOnValidNumber}
          keyboardType="numeric"
          containerStyle={[
            inputContainerStyle,
            { width: cardNumberInputWidth || CARD_NUMBER_INPUT_WIDTH },
          ]} />
          {renderInputButton()}
      </Fragment>
    );

    const cardDataInput = (
      <Fragment>
        <CCInput
          {...this._inputProps("expiry")}
          keyboardType="numeric"
          containerStyle={[
            inputContainerStyle,
            { width: expiryInputWidth || EXPIRY_INPUT_WIDTH },
          ]} />
          {requiresCVC && !isAmex && (
            <CCInput
              {...this._inputProps("cvc")}
              isLast={!requiresPostalCode && !requiresName}
              keyboardType="numeric"
              containerStyle={[
                inputContainerStyle,
                { width: cvcInputWidth || CVC_INPUT_WIDTH },
              ]}
              secureTextEntry={hideCVC} />
          )}
          {requiresCVC && isAmex && (
            <CCInput
              {...this._inputProps("cvc")}
              isLast={!requiresPostalCode && !requiresName}
              keyboardType="numeric"
              containerStyle={[
                inputContainerStyle,
                { width: cvcInputWidth || CVC_INPUT_WIDTH },
              ]}
              secureTextEntry={hideCVC}
              placeholder={placeholders.cvcAmex} />
          )}
      </Fragment>
    );

    const cardNameInput = requiresName && (
      <CCInput
        {...this._inputProps("name")}
        isLast={!requiresPostalCode && requiresName}
        containerStyle={[
          inputContainerStyle,
          { width: nameInputWidth || NAME_INPUT_WIDTH },
        ]} />
    );

    const cardPostalCodeInput = requiresPostalCode && (
      <CCInput
        {...this._inputProps("postalCode")}
        keyboardType="numeric"
        isLast={requiresPostalCode}
        containerStyle={[
          inputContainerStyle,
          { width: postalCodeInputWidth || POSTAL_CODE_INPUT_WIDTH },
        ]} />
    );

    return (
      <View style={[s.container, containerStyle]}>
        <CreditCard
          focused={focused}
          brand={type}
          scale={cardScale}
          fontSize={cardFontSize}
          fontFamily={cardFontFamily}
          imageFront={cardImageFront}
          imageBack={cardImageBack}
          customIcons={cardBrandIcons}
          name={requiresName ? name : " "}
          number={number}
          expiry={expiry}
          cvc={cvc}
          placeholder={cardPlaceholders}
          hideCVC={hideCVC} />
        <ScrollView
          ref="Form"
          horizontal={!verticalFields}
          keyboardShouldPersistTaps="always"
          scrollEnabled={allowScroll}
          showsHorizontalScrollIndicator={false}
          style={s.form}>
          {verticalFields ? (
            <Fragment>
              <View style={s.cardNumberContainer}>
                {cardNumberInput}
              </View>
              <View style={s.cvcDuedateContainer}>
                {cardDataInput}
              </View>
              <View style={s.cardHolderNameContainer}>
                {cardNameInput}
              </View>
              {cardPostalCodeInput}
            </Fragment>
          ) : (
            <Fragment>
              {cardNumberInput}
              {cardDataInput}
              {cardNameInput}
              {cardPostalCodeInput}
            </Fragment>
          )}

        </ScrollView>
      </View>
    );
  }
}

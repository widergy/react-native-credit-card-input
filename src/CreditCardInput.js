import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import ReactNative, {
  NativeModules,
  UIManager,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
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

    labelStyle: PropTypes.any,
    inputStyle: PropTypes.any,
    inputContainerStyle: PropTypes.any,
    containerStyle: PropTypes.any,

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

  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.fieldRefs = {};
    this._setFieldRef = this._setFieldRef.bind(this);
  }

  componentDidMount() {
    this._focus(this.props.focused);
  }

  componentWillReceiveProps = newProps => {
    if (this.props.focused !== newProps.focused) this._focus(newProps.focused);
  };

  _setFieldRef(field) {
    return ref => {
      this.fieldRefs[field] = ref;
    };
  }

  _focus = field => {
    if (!field) return;

    const scrollResponder = this.formRef.current && this.formRef.current.getScrollResponder && this.formRef.current.getScrollResponder();
    const fieldInstance = this.fieldRefs[field];

    const inputNode = fieldInstance && (fieldInstance.inputRef && fieldInstance.inputRef.current ? fieldInstance.inputRef.current : fieldInstance);
    const nodeHandle = ReactNative.findNodeHandle(inputNode);
    const scrollNodeHandle = ReactNative.findNodeHandle(this.formRef.current);

    const handleSuccess = x => {
      if (scrollResponder && scrollResponder.scrollTo) {
        scrollResponder.scrollTo({
          x: Math.max(x - PREVIOUS_FIELD_OFFSET, 0),
          animated: true,
        });
      }
      if (fieldInstance && typeof fieldInstance.focus === "function") {
        fieldInstance.focus();
      }
    };

    if (UIManager && typeof UIManager.measureLayout === "function") {
      try {
        UIManager.measureLayout(
          nodeHandle,
          scrollNodeHandle,
          e => {
            throw e;
          },
          x => handleSuccess(x)
        );
        return;
      } catch (e) {
        // continue other fallbacks
      }
    }
    if (NativeModules && NativeModules.UIManager && typeof NativeModules.UIManager.measureLayoutRelativeToParent === "function") {
      NativeModules.UIManager.measureLayoutRelativeToParent(
        nodeHandle,
        e => {
          throw e;
        },
        x => handleSuccess(x)
      );
      return;
    }

    if (inputNode && typeof inputNode.measureLayout === "function") {
      inputNode.measureLayout(
        scrollNodeHandle,
        x => handleSuccess(x),
        e => {
          throw e;
        }
      );
      return;
    }

    if (inputNode && typeof inputNode.measure === "function") {
      inputNode.measure((x, y, width, height, pageX) => {
        if (scrollResponder && scrollResponder.scrollTo) {
          scrollResponder.scrollTo({
            x: Math.max(pageX - PREVIOUS_FIELD_OFFSET, 0),
            animated: true,
          });
        }
        if (fieldInstance && typeof fieldInstance.focus === "function") {
          fieldInstance.focus();
        }
      });
      return;
    }

    if (fieldInstance && typeof fieldInstance.focus === "function") {
      fieldInstance.focus();
    }
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
          ref={this._setFieldRef("number")}
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
          ref={this._setFieldRef("expiry")}
          keyboardType="numeric"
          containerStyle={[
            inputContainerStyle,
            { width: expiryInputWidth || EXPIRY_INPUT_WIDTH },
          ]} />
          {requiresCVC && !isAmex && (
            <CCInput
              {...this._inputProps("cvc")}
              ref={this._setFieldRef("cvc")}
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
              ref={this._setFieldRef("cvc")}
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
        ref={this._setFieldRef("name")}
        isLast={!requiresPostalCode && requiresName}
        containerStyle={[
          inputContainerStyle,
          { width: nameInputWidth || NAME_INPUT_WIDTH },
        ]} />
    );

    const cardPostalCodeInput = requiresPostalCode && (
      <CCInput
        {...this._inputProps("postalCode")}
        ref={this._setFieldRef("postalCode")}
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
          ref={this.formRef}
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

import { Button } from "@material-ui/core";
import strings from "locales/strings";
import React from "react";
import { StepIndicator } from "routes/welcome/stepper/stepIndicator";
import styles from "routes/welcome/stepper/styles.module.scss";

interface Props {
  readonly className: string;
  readonly isNextAvailable: boolean;
  readonly onCancel: () => void;
  readonly onStepChange: (index: number) => void;
  readonly onCompleted: () => void;
}

export const Stepper: React.FC<React.PropsWithChildren<Props>> = (
  props: React.PropsWithChildren<Props>,
): React.ReactElement => {
  const { onStepChange, onCompleted } = props;

  const [currentStep, setCurrentStep] = React.useState<number>(0);
  const children = React.Children.toArray(props.children);

  const titles = children.map((child: React.ReactNode): string => {
    const element = child as React.ReactElement;
    if (element.props.title) {
      return element.props.title;
    } else {
      throw new Error("children must have a `title' prop defined");
    }
  });

  React.useEffect((): void => {
    onStepChange(currentStep);
  }, [currentStep, onStepChange]);

  const next = (): void => {
    if (currentStep + 1 <= children.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onCompleted();
    }
  };

  const back = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.stepIndicatorContainer}>
        {titles.map(
          (title: string, index: number): React.ReactElement => (
            <StepIndicator
              key={title}
              title={title}
              ordinal={index + 1}
              active={currentStep >= index}
            />
          ),
        )}
      </div>
      <div className={styles.content}>{children[currentStep]}</div>
      <div className={styles.buttonsBox}>
        {currentStep === 0 ? (
          <Button variant={"text"} onClick={props.onCancel}>
            {strings.CANCEL}
          </Button>
        ) : null}
        {currentStep === 1 ? (
          <Button variant={"text"} onClick={back}>
            {strings.BACK}
          </Button>
        ) : null}
        <Button
          variant={"contained"}
          disabled={!props.isNextAvailable}
          color={"primary"}
          onClick={next}
        >
          {currentStep === children.length - 1 ? strings.FINISH : strings.NEXT}
        </Button>
      </div>
    </div>
  );
};

import "./styles.scss";

import { Button, Typography } from "@material-ui/core";
import { ApplicationBar } from "components/ApplicationBar";
import ApplicationMenu from "components/ApplicationMenu";
import { Block } from "components/block";
import { SessionStore, SessionStoreContext } from "mobx/stores/sessionStore";
import { observer } from "mobx-react";
import React from "react";

const PageMenu: React.FC<React.PropsWithChildren<any>> = observer(
  (props: React.PropsWithChildren<any>): React.ReactElement => {
    const sessionStore = React.useContext<SessionStore>(SessionStoreContext);
    const classes: string[] = ["application-content"];
    const { warning } = sessionStore;
    const items = sessionStore.menu;
    if (items.length === 0) {
      classes.push("empty-menu");
    }
    return (
      <>
        <ApplicationBar />
        <ApplicationMenu items={items} />
        <Block className={classes.join(" ")}>
          {warning ? (
            <Block className={"application-content-warning"}>
              <Block className={"application-content-warning-content"}>
                <Block className={"application-content-warning-title"}>
                  <Typography variant={"h4"}>{warning.title}</Typography>
                </Block>
                <Block className={"application-content-warning-message"}>
                  <Typography variant={"subtitle2"}>
                    {warning.message}
                  </Typography>
                </Block>
              </Block>
              <Block className={"application-content-warning-action"}>
                <Button variant={"contained"} onClick={warning.action.handler}>
                  {warning.action.label}
                </Button>
              </Block>
            </Block>
          ) : null}
          {props.children}
        </Block>
      </>
    );
  },
);

export default PageMenu;

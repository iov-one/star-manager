import "./style.scss";

import { Col, Row } from "antd";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { ResolvedStarnameData } from "types/resolvedStarnameData";
import { StarnameProfilePage } from "types/starnameProfile";

import Section from "../../Section";
import { PAYMENT_SCREEN } from "../NavigationBar/NavigationOptions";
import ProfileViewWrapper from "../ProfileViewWrapper";
import { resolveStarname } from "./helper";

interface Props extends RouteComponentProps<{ starname: string }> {
  readonly page: StarnameProfilePage;
  readonly searchParams: URLSearchParams;
}

const GetStarnameProfile: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { match } = props;
  const { starname } = match.params;
  const fullName = starname.indexOf("*") === -1 ? "*" + starname : starname;

  const [starnameData, setStarnameData] = React.useState<
    ResolvedStarnameData | undefined
  >(undefined);
  const [starnameExists, setStarnameExists] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  React.useEffect((): void => {
    resolveStarname(fullName)
      .then((response: ResolvedStarnameData): void => {
        setStarnameExists(!!response.accountInfo);
        setStarnameData(response);
      })
      .catch((error: any): void => {
        console.error(error);
        setStarnameExists(true);
      })
      .finally((): void => setLoading(false));
  }, [starname, fullName]);
  return (
    <Section
      showHeader={true}
      showSearch={false}
      lightNavigation={true}
      lastHeadingBorder={true}
      headingOptions={PAYMENT_SCREEN}
    >
      <Row className={"d-flex justify-content-center section-Others"}>
        <Col xs={24} md={17} lg={16}>
          <ProfileViewWrapper
            starnameExists={starnameExists}
            loading={loading}
            starnameData={starnameData}
            starname={fullName}
            page={props.page}
            searchParams={props.searchParams}
          />
        </Col>
      </Row>
    </Section>
  );
};

export default withRouter(GetStarnameProfile);

import "./style.scss";

import React from "react";
import { ResolvedStarnameData } from "types/resolvedStarnameData";
import { StarnameProfilePage } from "types/starnameProfile";

import { ProfileView } from "../ProfileView";
import StarnameNotFound from "../StarnameNotFound";
import StarnameProfileLoading from "../StarnameProfileLoading";
import StarnameWithoutProfile from "../StarnameWithoutProfile";

type Props = {
  readonly starnameData: ResolvedStarnameData | undefined;
  readonly starname: string;
  readonly loading: boolean;
  readonly page: StarnameProfilePage;
  readonly starnameExists: boolean;
  readonly searchParams: URLSearchParams;
};

const ProfileViewWrapper: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  if (props.loading) {
    return <StarnameProfileLoading />;
  } else if (props.starnameExists && props.starnameData !== undefined) {
    // FIXME: we can handle No resources profile right here, by checking resources.length > 0
    return (
      <ProfileView
        starnameData={props.starnameData}
        starname={props.starname}
        page={props.page}
        loading={false}
        searchParams={props.searchParams}
      />
    );
  } else if (props.starnameExists && props.starnameData === undefined) {
    return <StarnameWithoutProfile starname={props.starname} />;
  } else {
    return <StarnameNotFound starname={props.starname} />;
  }
};

export default ProfileViewWrapper;

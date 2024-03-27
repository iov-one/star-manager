import React from "react";
import { StarnameProfilePage } from "types/starnameProfile";

import GetStarnameProfile from "./components/GetStarnameProfile";

interface ProfilePageProps {
  page: StarnameProfilePage;
}

const StarnameProfile: React.FC<ProfilePageProps> = ({
  page,
}: ProfilePageProps): React.ReactElement => {
  const searchParams = new URLSearchParams(window.location.search);
  return <GetStarnameProfile page={page} searchParams={searchParams} />;
};

export default StarnameProfile;

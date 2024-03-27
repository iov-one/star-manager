import config from "config";
import strings from "locales/strings";
import React from "react";

const ProfileWithNoInfo = (): React.ReactElement => {
  return (
    <div className="empty-profile-container">
      <div className="empty-profile-title">
        {strings.EMPTY_STARNAME_PROFILE_TITLE}
      </div>
      <div className="empty-profile-content">
        <div className="empty-profile-payer">
          {strings.EMPTY_STARNAME_PROFILE_PAYER_CONTENT}{" "}
          <a href={config.managerUrl} target="_blank" rel="noreferrer">
            Starname App
          </a>
          .
        </div>
        <div className="empty-profile-owner">
          {strings.EMPTY_STARNAME_PROFILE_OWNER_CONTENT}{" "}
          <a href={config.managerUrl} target="_blank" rel="noreferrer">
            Starname App
          </a>
          .
        </div>
      </div>
    </div>
  );
};

export default ProfileWithNoInfo;

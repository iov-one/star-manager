import { Link, makeStyles, Typography } from "@material-ui/core";
import { Block } from "components/block";
import config from "config";
import React from "react";

const addLinkTo = (link: string): React.ReactElement => (
  <Link href={link}>{link}</Link>
);
const useStyles = makeStyles(() => ({
  root: {
    margin: 50,
  },
  heading: {
    fontSize: 25,
    fontWeight: 600,
    marginTop: 20,
  },
  text: {
    fontSize: 15,
  },
}));
function PolicyLayoutInternal(): React.ReactElement {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography className={classes.heading}>IOV Privacy Policy</Typography>
      <Block alignSelf={"start"}>
        <Typography className={classes.text} color={"secondary"}>
          Updated on [-] November 2018
        </Typography>
      </Block>
      <section>
        <Typography className={classes.text}>
          IOV SAS, a French company, the provider our website,{" "}
          {config.websiteName}, and other sites we own and operate (the
          “Websites”) is committed to protecting your privacy online. Please
          read the following to learn what information we collect from you (the
          “User” or the “End User”) and how we use that information. If you have
          any questions about our privacy policy, please email us.
        </Typography>
        <Typography className={classes.text}>
          BY ACCESSING OR USING OUR WEBSITES, YOU ACKNOWLEDGE THAT YOU HAVE
          READ, UNDERSTAND, AND AGREE TO BE BOUND TO ALL THE TERMS OF THIS
          PRIVACY POLICY. IF YOU DO NOT AGREE TO THESE TERMS, EXIT THIS PAGE AND
          DO NOT ACCESS OR USE THE WEBSITES.
        </Typography>
      </section>
      <Typography className={classes.heading}>
        Types of Information Collected
      </Typography>
      <section>
        <Typography className={classes.text}>
          We process the following personal information about you:
        </Typography>
        <Typography className={classes.text}>
          Information that you provide to us
        </Typography>
        <Typography className={classes.text}>
          IOV processes every information that you choose to provide to us as
          well as the following data:
        </Typography>
        <Block padding={1} margin={1}>
          <Typography className={classes.text}>
            - Your first name, name and gender;
          </Typography>
          <Typography className={classes.text}>- Citizenship;</Typography>
          <Typography className={classes.text}>
            - Mailing address, email, phone number;
          </Typography>
          <Typography className={classes.text}>
            - Name of your company, position;
          </Typography>
          <Typography className={classes.text}>- Email;</Typography>
          <Typography className={classes.text}>- IP address;</Typography>
          <Typography className={classes.text}>
            - Every information necessary for the provision our services
            pursuant to a contract (payment information, services history…);
          </Typography>
          <Typography className={classes.text}>
            - Login and access codes;
          </Typography>
          <Typography className={classes.text}>
            - Social media profile;
          </Typography>
          <Typography className={classes.text}>
            - Your preferences about commercial solicitation.
          </Typography>
        </Block>
        <Typography className={classes.text}>
          Your personal information is collected when:
        </Typography>
        <Block padding={1} margin={1}>
          <Typography className={classes.text}>
            - You register on our Websites;
          </Typography>
          <Typography className={classes.text}>
            - You subscribe to our newsletter;
          </Typography>
          <Typography className={classes.text}>- You contact us;</Typography>
          <Typography className={classes.text}>- You open a wallet;</Typography>
          <Typography className={classes.text}>
            - You interact with our company.
          </Typography>
        </Block>
      </section>
      <Typography className={classes.heading}>
        Use of your personal information
      </Typography>
      <section>
        <Typography className={classes.text}>
          IOV will only process your personal data for the following purposes:
        </Typography>
        <Block padding={1} margin={1}>
          <Typography className={classes.text}>
            - To visit our Website;
          </Typography>
          <Typography className={classes.text}>
            - To activate your account;
          </Typography>
          <Typography className={classes.text}>
            - To provide our services and execute our contractual obligations;
          </Typography>
          <Typography className={classes.text}>
            - To ensure communication on our services and customize our offers;
          </Typography>
          <Typography className={classes.text}>
            - To provide our newsletter;
          </Typography>
          <Typography className={classes.text}>
            - To understand and answer your expectations, comments and
            suggestions;
          </Typography>
          <Typography className={classes.text}>
            - To analyze and predict your preferences so that we can offer you
            tailored services or that may interest you;
          </Typography>
          <Typography className={classes.text}>
            - To send you marketing communications;
          </Typography>
          <Typography className={classes.text}>
            - Conduct surveys, analysis and statistics;
          </Typography>
          <Typography className={classes.text}>
            - Inform you on the improvement of our services;
          </Typography>
          <Typography className={classes.text}>
            - To comply with our regulatory requirements;
          </Typography>
          <Typography className={classes.text}>
            - If any, to process your claims.
          </Typography>
        </Block>
        <Typography className={classes.text}>
          Also, we may aggregate and/or anonymize your data so that it will no
          longer be considered as personal data. We do so to generate other data
          for our use, which we may use and disclose for any purpose (including
          in particular, for statistics, services analyses, provision of new
          services….
        </Typography>
      </section>
      <Typography className={classes.heading}>
        What is our legal basis to use or process your personal information?
      </Typography>
      <section>
        <Typography className={classes.text}>
          Your personal information is only processed by IOV when we have a
          legal basis to do so and in particular:
        </Typography>
        <Block padding={1} margin={1}>
          <Typography className={classes.text}>
            - to perform our obligations in accordance with any contract that we
            may have with you (for instance, to register on our Websites, answer
            your queries, provide our services….);
          </Typography>
          <Typography className={classes.text}>
            - in case of consent (by navigating on our Websites, clicking on a
            ticking box…). You may withdraw your consent at any time;
          </Typography>
          <Typography className={classes.text}>
            {`- it is in our legitimate interest or a third party's legitimate
            interest to use personal information in such a way to ensure that we
            provide our services in the best way that we can;`}
          </Typography>
          <Typography className={classes.text}>
            - it is our legal obligation to use your personal information to
            comply with any legal obligations imposed upon us.
          </Typography>
        </Block>
      </section>
      <Typography className={classes.heading}>
        Release of personal Information
      </Typography>
      <section>
        <Typography className={classes.text}>
          Our commercial partners and companies (the “Third-Party Service
          Providers”) who work with us for management of our Websites,
          performance of our contracts with you, hosting of your data and
          provision of our business operations exclusively process your personal
          data within the scope of the missions entrusted to them. These
          Third-Party Service Providers may contact you directly using the
          personal data that you provided us or that we obtained lawfully from
          third parties. We strictly require from our Third-Party Service
          Providers that they process your personal in data in compliance with
          personal data applicable regulation and to implement appropriate
          measure to ensure security and confidentiality of your personal
          information.
        </Typography>
        <Typography className={classes.text}>
          We may also release your information when we believe release is
          appropriate to comply with the law, protect ours rights, or if all or
          part of our assets is transferred to another company.
        </Typography>
        <Typography className={classes.text}>
          Lastly, aggregated data, meaning non-identifiable data can be
          transferred to third parties for marketing, advertising or any other
          purpose.
        </Typography>
      </section>
      <Typography className={classes.heading}>
        Location of your personal information
      </Typography>
      <section>
        <Typography className={classes.text}>
          When transferring your personal information outside of the EEA, IOV
          will (and will ensure that service providers acting on our behalf
          agree to) protect it from improper use or disclosure and ensure the
          same levels of protection are in place as are applied within the EEA.
        </Typography>
        <Typography className={classes.text}>
          You hereby consent to the transfer of your personal data outside the
          European Union.
        </Typography>
      </section>
      <Typography className={classes.heading}>
        Updating and Correcting Information
      </Typography>
      <section>
        <Typography className={classes.text}>
          When transferring your personal information outside of the EEA, IOV
          will (and will ensure that service providers acting on our behalf
          agree to) protect it from improper use or disclosure and ensure the
          same levels of protection are in place as are applied within the EEA.
        </Typography>
        <Block padding={1} margin={1}>
          <Typography variant={"subtitle2"} component={"span"}>
            {" "}
            - Access to your information
          </Typography>
          <Typography className={classes.text} component={"span"}>
            &nbsp;– You have the right to request a copy of your personal
            information that we hold.
          </Typography>
          <Block />
          <Typography variant={"subtitle2"} component={"span"}>
            {" "}
            - Correcting your information
          </Typography>
          <Typography className={classes.text} component={"span"}>
            &nbsp;– IOV ensures to make sure that your personal information is
            accurate, complete and up to date. At any time, you may ask us to
            correct your personal information.
          </Typography>
          <Block />
          <Typography variant={"subtitle2"} component={"span"}>
            {" "}
            - Deletion of your information
          </Typography>
          <Typography className={classes.text} component={"span"}>
            &nbsp;– You have the right to ask us to delete personal information
            about you where i) You consider that we no longer require the
            information for the purposes for which it was obtained or ii) our
            use of your personal information is contrary to law or our other
            legal obligations.
          </Typography>
          <Block />
          <Typography variant={"subtitle2"} component={"span"}>
            {" "}
            - Oppose or restrict how we may use your information
          </Typography>
          <Typography className={classes.text} component={"span"}>
            &nbsp;– You may ask us to restrict how we use your personal
            information or oppose to such process. In this case, we may only use
            the relevant personal information with your consent, for legal
            claims or where there are other public interest grounds.
          </Typography>
          <Block />
          <Typography variant={"subtitle2"} component={"span"}>
            {" "}
            - Opt-out to the reception of newsletters.
          </Typography>
          <Typography className={classes.text} component={"span"}>
            &nbsp;You may at any time decide to opt-out to the reception of our
            newsletters.
          </Typography>
          <Block />
          <Typography className={classes.text} component={"span"}>
            {" "}
            - Right to data portability
          </Typography>
          <Typography className={classes.text} component={"span"}>
            &nbsp;– You have the right, in certain circumstances, to obtain
            personal information you have provided us with (in a structured,
            commonly used and machine-readable format) and to reuse it elsewhere
            or to ask us to transfer this to a third party of your choice
            (please note that this right is limited to the data you provided to
            us).
          </Typography>
        </Block>
        <Typography className={classes.text}>
          These requests must be addressed by written request to IOV,&nbsp;
          <Link href={"mailto:privacy@iov.one"}>privacy@iov.one</Link>
        </Typography>
        <Typography className={classes.text}>
          If our answer is not satisfactory within the time limit set by the
          applicable law, you may lodge a complaint with the relevant data
          protection supervisory authority. however, because we keep track of
          past transactions, you cannot delete information associated with past
          transactions on the Websites. In addition, in may be impossible for us
          to completely delete all your information because we periodically
          backup information.
        </Typography>
      </section>
      <Typography className={classes.heading}>
        Security of Information
      </Typography>
      <section>
        <Typography className={classes.text}>
          We take security seriously and take numerous precautions to protect
          the security of Personally Identifiable Information to protect the
          personal data that we have under our control from unauthorized access,
          improper use or disclosure, unauthorized modification and unlawful
          destruction or accidental loss.
        </Typography>
        <Typography className={classes.text}>
          Unfortunately, no data transmission over the Internet or any wireless
          network can be guaranteed to be 100% secure. As a result, while we
          employ commercially reasonable security measures to protect data and
          seek to partner with companies which do the same, we cannot guarantee
          the security of any information transmitted to or from the Websites,
          and are not responsible for the actions of any third parties that may
          receive any such information.
        </Typography>
      </section>
      <Typography className={classes.heading}>Retention period</Typography>
      <section>
        <Typography className={classes.text}>
          For visitors to the Websites, we will retain relevant personal
          information for at least three years from the date of our last
          interaction with you and in compliance with our obligations under the
          GDPR or similar legislation around the world, or for longer if we are
          required to do so according to our regulatory obligations.
        </Typography>
        <Typography className={classes.text}>
          For service and product provision to any client, we will retain
          relevant personal information for at least five years from the date of
          our last interaction with you and in compliance with our obligations
          under the GDPR or similar legislation around the world, or for longer
          as we are required to do so according to our regulatory obligations.
          We may then destroy such files without further notice or liability.
        </Typography>
        <Typography className={classes.text}>
          If you no longer want IOV to use your information to provide you with
          our products and services, you can close your account and IOV will
          delete the information it holds about you unless IOV needs to retain
          and use your information to comply with our legal obligations, to
          resolve disputes or to enforce our agreements.
        </Typography>
      </section>
      <Typography className={classes.heading}>Cookies</Typography>
      <section>
        <Typography className={classes.text}>
          To facilitate and customize your experience with the Websites, we
          store cookies on your computer. A cookie is a small text file that is
          stored on a User’s computer for record-keeping purposes which contains
          information about that User. We use cookies to save you time while
          using the Websites, remind us who you are, and track and target User
          interests in order to provide a customized experience. Cookies also
          allow us to collect information from you, like which pages you visited
          and what links you clicked on. Use of this information helps us to
          create a more user-friendly experience for all visitors. Cookies are
          also placed when you decide to use sharing buttons linked to social
          networks. . We have no access to or control over these cookies. This
          Privacy Policy covers the use of cookies by our Websites only and does
          not cover the use of cookies by any third party. Most browsers
          automatically accept cookies, but you may be able to modify your
          browser settings to decline cookies. Please note that if you decline
          or delete these cookies, some parts of the Websites may not work
          properly. These following links may help you:
        </Typography>
        <Block padding={1} margin={1}>
          <Typography className={classes.text}>
            - Internet Explorer :{" "}
            {addLinkTo(
              "http://windows.microsoft.com/fr-FR/windows-vista/Block-or-allow-cookies",
            )}
          </Typography>
          <Typography className={classes.text}>
            - Chrome :{" "}
            {addLinkTo(
              "http://support.google.com/chrome/bin/answer.py?hl=fr&hlrm=en&answer=95647",
            )}
          </Typography>
          <Typography className={classes.text}>
            - Firefox :{" "}
            {addLinkTo(
              "http://support.mozilla.org/fr/kb/Activer et d%C3%A9sactiver les cookies",
            )}
          </Typography>
          <Typography className={classes.text}>
            - Safari :{" "}
            {addLinkTo(
              "http://docs.info.apple.com/article.html?path=Safari/3.0/fr/9277.html",
            )}
          </Typography>
        </Block>
        <Typography className={classes.text}>
          Other Tracking Devices. We may use other industry standard
          technologies like pixel tags and web beacons to track your use of our
          Websites pages and promotions, or we may allow our Third Party Service
          Providers to use these devices on our behalf. Pixel tags and web
          beacons are tiny graphic images placed on certain pages on our
          Websites, or in our emails that allow us to determine whether you have
          performed a specific action. When you access these pages or open or
          click an email, pixel tags and web beacons generate a notice of that
          action. Pixel tags allow us to measure and improve our understanding
          of visitor traffic and behavior on our Websites, as well as give us a
          way to measure our promotions and performance. We may also utilize
          pixel tags and web beacons provided by our Affiliates and/or Marketing
          Partners for the same purposes.
        </Typography>
      </section>
      <Typography className={classes.heading}>
        Privacy Policies of Third-Party Websites
      </Typography>
      <section>
        <Typography className={classes.text}>
          This Privacy Policy only addresses the use and disclosure of
          information we collect from you on our Websites. Other websites that
          may be accessible through this Website have their own privacy policies
          and data collection, use and disclosure practices. If you link to any
          such website, we urge you review the website’s privacy policy. We are
          not responsible for the policies or practices of third parties.
        </Typography>
      </section>
      <Typography className={classes.heading}>Children</Typography>
      <section>
        <Typography className={classes.text}>
          Minors under the age of 18 may not use the Websites. We do not collect
          personal information from anyone under the age of 18, and no part of
          the Websites is designed to attract anyone under the age of 18. By
          accessing to the Site, you declare that you are older than 18.
        </Typography>
        <Typography className={classes.text}>
          You may choose at any time to opt-in to our newsletters.
        </Typography>
      </section>
      <Typography className={classes.heading}>
        Changes to Privacy Policy
      </Typography>
      <section>
        <Typography className={classes.text}>
          If we decide to change our privacy policy, we will post those changes
          to this privacy statement, the home page, and other places we deem
          appropriate so that you are aware of what information we collect, how
          we use it, and under what circumstances, if any, we disclose it. We
          reserve the right to modify this privacy statement at any time, so
          please review it frequently. If we make material changes to this
          policy, we will notify you here, by email, or by means of notice on
          our home page.
        </Typography>
      </section>
      <Typography className={classes.heading}>Contacting Us</Typography>
      <section>
        <Typography className={classes.text}>
          For further information about this policy, please contact{" "}
          <Link href={"mailto:contact@iov.one"}>contact@iov.one</Link>
        </Typography>
      </section>
    </div>
  );
}

export default PolicyLayoutInternal;

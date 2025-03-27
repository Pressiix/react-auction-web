import { useState } from "react";
import Modal from "./Modal";
import privacyPolicyContent from "../assets/markdowns/privacy-policy.md?raw";
import termAndConditionsContent from "../assets/markdowns/terms-and-conditions.md?raw";
import howToPlayContent from "../assets/markdowns/how-to-play.md?raw";
import Markdown from "./Markdown";

const Footer = () => {
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacyPolicy, setOpenPrivacyPolicy] = useState(false);
  const [openHowToPlay, setOpenHowToPlay] = useState(false);

  const LeftComponent = () => (
    <ul className="flex flex-wrap space-x-4 sm:space-x-4">
      <li>
        <img
          src="/images/ootn/ootn-logo.png"
          alt="ootn-logo"
          className="h-8 w-auto"
        />
      </li>
      <li className="flex space-x-2">
        <img
          src="/images/ootn/cover-logo-1.png"
          alt="cover-logo-1"
          className="h-6"
        />
        <img
          src="/images/ootn/cover-logo-2.png"
          alt="cover-logo-2"
          className="h-6"
        />
      </li>
    </ul>
  );

  const TermsModal = () => (
    <Modal
      title="Terms and Conditions"
      className="h-[700px] w-[600px]"
      onModalClose={(isOpen) => setOpenTerms(!isOpen)}
      hasCloseButton
      closeFromOverlay
    >
      <div className="w-full">
        <div className="prose prose-sm h-[500px] max-w-none overflow-y-auto ">
          <Markdown content={termAndConditionsContent} />
        </div>
      </div>
    </Modal>
  );

  const PrivacyPolicyModal = () => (
    <Modal
      title="Privacy Policy"
      className="h-[700px] w-[600px]"
      onModalClose={(isOpen) => setOpenPrivacyPolicy(!isOpen)}
      hasCloseButton
      closeFromOverlay
    >
      <div className="w-full">
        <div className="prose prose-sm h-[500px] max-w-none overflow-y-auto ">
          <div className="markdown-content">
            <Markdown content={privacyPolicyContent} />
          </div>
        </div>
      </div>
    </Modal>
  );

  const HowToPlayModal = () => (
    <Modal
      title="How to Play"
      className="h-[700px] w-[600px]"
      onModalClose={(isOpen) => setOpenHowToPlay(!isOpen)}
      hasCloseButton
      closeFromOverlay
    >
      <div className="w-full">
        <div className="prose prose-sm h-[500px] max-w-none overflow-y-auto ">
          <Markdown content={howToPlayContent} />
        </div>
      </div>
    </Modal>
  );

  const RightComponent = () => (
    <ul
      className="flex flex-wrap space-x-2 text-sm sm:text-base"
      style={{ color: "#7C60AA" }}
    >
      <li>
        <div onClick={() => setOpenTerms(true)} className="mx-2 cursor-pointer">
          Terms and Conditions
        </div>
      </li>
      <li>/</li>
      <li>
        <div
          onClick={() => setOpenPrivacyPolicy(true)}
          className="mx-2 cursor-pointer"
        >
          Privacy Policy
        </div>
      </li>
      <li>/</li>
      <li>
        <div
          onClick={() => setOpenHowToPlay(true)}
          className="mx-2 cursor-pointer"
        >
          How to Play
        </div>
      </li>
    </ul>
  );

  return (
    <footer className="bg-white py-4 text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <LeftComponent />
          <RightComponent />
        </div>
      </div>
      {openTerms && <TermsModal />}
      {openPrivacyPolicy && <PrivacyPolicyModal />}
      {openHowToPlay && <HowToPlayModal />}
    </footer>
  );
};

export default Footer;

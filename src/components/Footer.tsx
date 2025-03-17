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
          src="https://s3-alpha-sig.figma.com/img/2956/76ac/ea822f7c9d04df5a070e4837dcdd4f97?Expires=1742169600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=WNF-2OOMVr1tkHH7jrW7S32moOm6xvUWyd0Y17GyNyVr3jVNMiECyfZCF~poEZ0ORXAg1DAF~wjkDOBuiPQ~mwrgQCSnZgu3leYCVi2RU1c1eXma8SNvHKKWD-8ka-FsEFCp0O0BDb9D7qJFJqB0Q2NI3SaaitXwnBLVMk7rOgp99M2HfMvKcYM9vKg1zs25V13Dn2Hu4jF00Ewts~lYB26n9Op11BTqDF2EEBWNZz~V~X7EqhZFQGr8PDMlnkoXkvuL0sl1zTqPGUPj~mO5xLTqt~0NuyKCHWeGuLDy~04GKgKb0etgpZuMst9wFqcK59tKluEJIkiLhR8f2UR-Zg__"
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

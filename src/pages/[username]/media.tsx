import Profile from "../../components/profile";
import type { GibberPage } from "../../types/next";

const WithRepliesPage: GibberPage = () => {
    return <Profile postFilter="media" />;
};

export default WithRepliesPage;

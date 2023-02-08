import { type NextPage } from "next";

import Profile from "../../components/profile";

const WithRepliesPage: NextPage = () => {
    return <Profile postFilter="media" />;
};

export default WithRepliesPage;

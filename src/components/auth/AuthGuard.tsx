import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

import Spinner from "../Spinner";

interface IAuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<IAuthGuardProps> = ({ children }) => {
    const { status: sessionStatus } = useSession();

    useEffect(() => {
        if (sessionStatus === "unauthenticated") {
            void signIn();
        }
    }, [sessionStatus]);

    if (["loading", "unauthenticated"].includes(sessionStatus)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return <>{children}</>;
};

export default AuthGuard;

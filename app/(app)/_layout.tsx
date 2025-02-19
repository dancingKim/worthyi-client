import { Stack, Redirect } from 'expo-router';
import { useAuth } from "@/context/AuthContext";
import Loading from "@/app/loading";

export default function AppLayout() {
    console.log('App layout rendering');
    const { isLoggedIn, isLoading } = useAuth();
    console.log('AppLayout: isLoggedIn =', isLoggedIn, 'isLoading =', isLoading);

    if (isLoading) {
        console.log('AppLayout: showing loading screen');
        return <Loading/>;
    }

    // if (!isLoggedIn) {
    //     console.log('Not logged in, redirecting to login');
    //     return <Redirect href="/login" />;
    // }

    console.log('AppLayout: about to render Stack');
    return (
        <Stack>
            <Stack.Screen 
                name="(tabs)" 
                options={{ 
                    headerShown: false,
                    animation: 'none'
                }} 
            />
        </Stack>
    );
}

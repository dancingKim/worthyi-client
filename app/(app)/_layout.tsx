import { Stack, Redirect } from 'expo-router';
import { useAuth } from "@/context/AuthContext";
import Loading from "@/app/loading";

export default function AppLayout() {
    console.log('App layout rendering');
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
        return <Loading/>;
    }

    if (!isLoggedIn) {
        console.log('Not logged in, redirecting to login');
        return <Redirect href="/login" />;
    }

    console.log('Logged in, rendering Stack with tabs');
    return (
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: '#fff' }
          }}
        >
            <Stack.Screen 
                name="(tabs)" 
                options={{ headerShown: false }} 
            />
        </Stack>
    );
}

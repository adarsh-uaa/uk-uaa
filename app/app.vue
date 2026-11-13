<template>
    <NuxtLoadingIndicator color="#c9a86a" :height="3" />
    <FlightLoader />
    <NuxtPage />
    <ClientOnly>
        <ToastContainer />
    </ClientOnly>
</template>

import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        refresh: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        prefetch: jest.fn(),
    }),
}));

jest.mock('./src/app/hooks/useTasks', () => ({
    useTasks: () => ({
        addTask: { mutate: jest.fn() },
        editTask: { mutate: jest.fn() },
        isLoading: false
    })
}));

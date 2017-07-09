class Timer {
    public interval: number;
    private readonly func: () => void;
    private running: boolean;
    private timerId: number;

    constructor(func: () => void, msInterval: number) {
        this.func = func;
        this.interval = msInterval;
        this.running = false;
    }

    public start(): void {
        if (this.running)
            return;
        this.running = true;
        this.timerId = window.setInterval(this.func, this.interval);
    }

    public stop(): void {
        if (!this.running)
            return;
        this.running = false;
        window.clearInterval(this.timerId);
    }
}

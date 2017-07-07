class DualQueue<T> {
    public length: number = 0;
    private readList: T[] = [];
    private writeList: T[] = [];

    public dequeue(): T { return this.readList.pop()!; }

    public push(data: T): void { this.writeList.push(data); }
    public swap(): boolean {
        if (this.readList.length !== 0)
            throw new Error("Readqueue must be empty");
        if (this.writeList.length === 0)
            return false;
        const tmp = this.readList;
        this.readList = this.writeList;
        this.writeList = tmp;
        this.length = this.readList.length;
        return true;
    }
}

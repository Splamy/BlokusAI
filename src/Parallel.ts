/// <reference path="Player/EasyAi.ts"/>

class Parallel {
    private static worker?: Worker[];
    private static results: any[];
    private static canParallel?: boolean = false;
    private static extraCores: number;

    public static checkParallel(): boolean {
        if (Parallel.canParallel !== undefined)
            return Parallel.canParallel;
        if (typeof (Worker) === "undefined") {
            return false;
        }
        Parallel.canParallel = Parallel.init();
        return Parallel.canParallel;
    }

    public static thinkEasyAi(tree: TreeData, player: PlayerId): void {
        if (!Parallel.checkParallel())
            throw new Error("Parallel operations are not supported");

        Parallel.results.length = 0;

        for (let i = 0; i < Parallel.extraCores; i++) {
            const split = Util.fairSplit(tree.Children!.length, i, Parallel.extraCores + 1);
            Parallel.worker![i].postMessage(new ParallizeData(i, player, split.Start, split.Length, tree.Children!));
        }
        const split = Util.fairSplit(tree.Children!.length, Parallel.extraCores, Parallel.extraCores + 1);
        const ownNodes = tree.Children!;
        for (let i = 0; i < ownNodes.length; i++) {
            const node = ownNodes[split.Start + i];
            node.Value = EasyAi.minmaxAdaptiveRecusive(node, player);
        }

        while (true) {
            let allDone = true;
            for (let i = 0; i < Parallel.extraCores; i++) {
                allDone = allDone && Parallel.results[i] !== undefined;
            }
            if (allDone)
                break;
        }
    }

    private static init(): boolean {
        if (Parallel.worker !== undefined)
            return true;
        Parallel.extraCores = navigator.hardwareConcurrency - 1;
        if (Parallel.extraCores <= 0)
            return false;

        Parallel.worker = new Array(Parallel.extraCores);
        Parallel.results = new Array(Parallel.extraCores);
        try {
            for (let i = 0; i < Parallel.extraCores; i++) {
                Parallel.worker[i] = new Worker("js/game.js");
                Parallel.worker[i].onmessage = (msg) => { Parallel.results[i] = msg.data; };
            }
        } catch (DOMException) {
            return false;
        }
        return true;
    }
}

// thinkEasyAi
self.onmessage = (msg) => {
    const data = msg.data as ParallizeData;
    console.log(`Working from ${data.Start} to ${data.Start + data.Length}`);
    for (let i = 0; i < data.Length; i++) {
        const node = data.Nodes[data.Start + i];
        node.Value = EasyAi.minmaxAdaptiveRecusive(node, data.Player);
    }
    postMessage(true, "*");
};

// tslint:disable max-classes-per-file
class ParallizeData {
    constructor(
        public WorkerId: number,
        public Player: PlayerId,
        public Start: number,
        public Length: number,
        public Nodes: TreeData[]) {
    }
}

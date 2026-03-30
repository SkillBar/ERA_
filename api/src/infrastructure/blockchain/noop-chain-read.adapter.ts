import type { ChainReadPort } from "../../application/ports/chain-read.port.js"

/** Заглушка до подключения RPC / контрактов. */
export class NoopChainReadAdapter implements ChainReadPort {
  async isHealthy(): Promise<boolean> {
    return true
  }
}

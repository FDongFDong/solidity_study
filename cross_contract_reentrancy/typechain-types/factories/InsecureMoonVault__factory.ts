/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type {
  Signer,
  AddressLike,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../common";
import type {
  InsecureMoonVault,
  InsecureMoonVaultInterface,
} from "../InsecureMoonVault";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IMoonToken",
        name: "_moonToken",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getUserBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "moonToken",
    outputs: [
      {
        internalType: "contract IMoonToken",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60a060405234801561001057600080fd5b50604051610bcf380380610bcf833981810160405281019061003291906100e1565b8073ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff16815250505061010e565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061009c82610071565b9050919050565b60006100ae82610091565b9050919050565b6100be816100a3565b81146100c957600080fd5b50565b6000815190506100db816100b5565b92915050565b6000602082840312156100f7576100f661006c565b5b6000610105848285016100cc565b91505092915050565b608051610a9161013e6000396000818161010d0152818161013301528181610338015261049e0152610a916000f3fe60806040526004361061004a5760003560e01c806312065fe01461004f5780633468145a1461007a57806347734892146100a5578063853828b6146100e2578063d0e30db0146100f9575b600080fd5b34801561005b57600080fd5b50610064610103565b60405161007191906105b2565b60405180910390f35b34801561008657600080fd5b5061008f61010b565b60405161009c919061064c565b60405180910390f35b3480156100b157600080fd5b506100cc60048036038101906100c791906106aa565b61012f565b6040516100d991906105b2565b60405180910390f35b3480156100ee57600080fd5b506100f76101d2565b005b610101610432565b005b600047905090565b7f000000000000000000000000000000000000000000000000000000000000000081565b60007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166370a08231836040518263ffffffff1660e01b815260040161018a91906106e6565b602060405180830381865afa1580156101a7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101cb919061072d565b9050919050565b60008054906101000a900460ff1615610220576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610217906107b7565b60405180910390fd5b60016000806101000a81548160ff02191690831515021790555060006102453361012f565b90506000811161028a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161028190610823565b60405180910390fd5b60003373ffffffffffffffffffffffffffffffffffffffff16826040516102b090610874565b60006040518083038185875af1925050503d80600081146102ed576040519150601f19603f3d011682016040523d82523d6000602084013e6102f2565b606091505b5050905080610336576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161032d906108d5565b60405180910390fd5b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663d3a5059a336040518263ffffffff1660e01b815260040161038f91906106e6565b6020604051808303816000875af11580156103ae573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103d2919061092d565b905080610414576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161040b906109a6565b60405180910390fd5b505060008060006101000a81548160ff021916908315150217905550565b60008054906101000a900460ff1615610480576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610477906107b7565b60405180910390fd5b60016000806101000a81548160ff02191690831515021790555060007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166340c10f1933346040518363ffffffff1660e01b81526004016104f79291906109c6565b6020604051808303816000875af1158015610516573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061053a919061092d565b90508061057c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161057390610a3b565b60405180910390fd5b5060008060006101000a81548160ff021916908315150217905550565b6000819050919050565b6105ac81610599565b82525050565b60006020820190506105c760008301846105a3565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600061061261060d610608846105cd565b6105ed565b6105cd565b9050919050565b6000610624826105f7565b9050919050565b600061063682610619565b9050919050565b6106468161062b565b82525050565b6000602082019050610661600083018461063d565b92915050565b600080fd5b6000610677826105cd565b9050919050565b6106878161066c565b811461069257600080fd5b50565b6000813590506106a48161067e565b92915050565b6000602082840312156106c0576106bf610667565b5b60006106ce84828501610695565b91505092915050565b6106e08161066c565b82525050565b60006020820190506106fb60008301846106d7565b92915050565b61070a81610599565b811461071557600080fd5b50565b60008151905061072781610701565b92915050565b60006020828403121561074357610742610667565b5b600061075184828501610718565b91505092915050565b600082825260208201905092915050565b7f4e6f2072652d656e7472616e6379000000000000000000000000000000000000600082015250565b60006107a1600e8361075a565b91506107ac8261076b565b602082019050919050565b600060208201905081810360008301526107d081610794565b9050919050565b7f496e73756666696369656e742062616c616e6365000000000000000000000000600082015250565b600061080d60148361075a565b9150610818826107d7565b602082019050919050565b6000602082019050818103600083015261083c81610800565b9050919050565b600081905092915050565b50565b600061085e600083610843565b91506108698261084e565b600082019050919050565b600061087f82610851565b9150819050919050565b7f4661696c656420746f2073656e64204574686572000000000000000000000000600082015250565b60006108bf60148361075a565b91506108ca82610889565b602082019050919050565b600060208201905081810360008301526108ee816108b2565b9050919050565b60008115159050919050565b61090a816108f5565b811461091557600080fd5b50565b60008151905061092781610901565b92915050565b60006020828403121561094357610942610667565b5b600061095184828501610918565b91505092915050565b7f4661696c656420746f206275726e20746f6b656e000000000000000000000000600082015250565b600061099060148361075a565b915061099b8261095a565b602082019050919050565b600060208201905081810360008301526109bf81610983565b9050919050565b60006040820190506109db60008301856106d7565b6109e860208301846105a3565b9392505050565b7f4661696c656420746f206d696e7420746f6b656e000000000000000000000000600082015250565b6000610a2560148361075a565b9150610a30826109ef565b602082019050919050565b60006020820190508181036000830152610a5481610a18565b905091905056fea2646970667358221220f1305ebc7ca696740e2cdda0e9943bea22b9006fa8cd4349d7316d6cf5cdcba364736f6c63430008110033";

type InsecureMoonVaultConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: InsecureMoonVaultConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class InsecureMoonVault__factory extends ContractFactory {
  constructor(...args: InsecureMoonVaultConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    _moonToken: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(_moonToken, overrides || {});
  }
  override deploy(
    _moonToken: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(_moonToken, overrides || {}) as Promise<
      InsecureMoonVault & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): InsecureMoonVault__factory {
    return super.connect(runner) as InsecureMoonVault__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): InsecureMoonVaultInterface {
    return new Interface(_abi) as InsecureMoonVaultInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): InsecureMoonVault {
    return new Contract(address, _abi, runner) as unknown as InsecureMoonVault;
  }
}

/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../common";

export interface AttackInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "attackInit"
      | "attackNext"
      | "attackPeer"
      | "getBalance"
      | "moonToken"
      | "moonVault"
      | "setAttackPeer"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "attackInit",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "attackNext",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "attackPeer",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getBalance",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "moonToken", values?: undefined): string;
  encodeFunctionData(functionFragment: "moonVault", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "setAttackPeer",
    values: [AddressLike]
  ): string;

  decodeFunctionResult(functionFragment: "attackInit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "attackNext", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "attackPeer", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getBalance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "moonToken", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "moonVault", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setAttackPeer",
    data: BytesLike
  ): Result;
}

export interface Attack extends BaseContract {
  connect(runner?: ContractRunner | null): Attack;
  waitForDeployment(): Promise<this>;

  interface: AttackInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  attackInit: TypedContractMethod<[], [void], "payable">;

  attackNext: TypedContractMethod<[], [void], "nonpayable">;

  attackPeer: TypedContractMethod<[], [string], "view">;

  getBalance: TypedContractMethod<[], [bigint], "view">;

  moonToken: TypedContractMethod<[], [string], "view">;

  moonVault: TypedContractMethod<[], [string], "view">;

  setAttackPeer: TypedContractMethod<
    [_attackPeer: AddressLike],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "attackInit"
  ): TypedContractMethod<[], [void], "payable">;
  getFunction(
    nameOrSignature: "attackNext"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "attackPeer"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getBalance"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "moonToken"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "moonVault"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "setAttackPeer"
  ): TypedContractMethod<[_attackPeer: AddressLike], [void], "nonpayable">;

  filters: {};
}

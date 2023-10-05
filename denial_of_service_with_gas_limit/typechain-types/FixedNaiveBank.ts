/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
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
} from "./common";

export interface FixedNaiveBankInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "INTEREST_RATE"
      | "batchApplyInterest"
      | "depositBankFunds"
      | "depositFor"
      | "getBankBalance"
      | "getUserBalance"
      | "getUserLength"
      | "owner"
      | "withdraw"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "INTEREST_RATE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "batchApplyInterest",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "depositBankFunds",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "depositFor",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getBankBalance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getUserBalance",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getUserLength",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "INTEREST_RATE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "batchApplyInterest",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "depositBankFunds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "depositFor", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getBankBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUserBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUserLength",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
}

export interface FixedNaiveBank extends BaseContract {
  connect(runner?: ContractRunner | null): FixedNaiveBank;
  waitForDeployment(): Promise<this>;

  interface: FixedNaiveBankInterface;

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

  INTEREST_RATE: TypedContractMethod<[], [bigint], "view">;

  batchApplyInterest: TypedContractMethod<
    [_beginUserID: BigNumberish, _endUserID: BigNumberish],
    [bigint],
    "nonpayable"
  >;

  depositBankFunds: TypedContractMethod<[], [void], "payable">;

  depositFor: TypedContractMethod<[_user: AddressLike], [void], "payable">;

  getBankBalance: TypedContractMethod<[], [bigint], "view">;

  getUserBalance: TypedContractMethod<[_user: AddressLike], [bigint], "view">;

  getUserLength: TypedContractMethod<[], [bigint], "view">;

  owner: TypedContractMethod<[], [string], "view">;

  withdraw: TypedContractMethod<
    [_withdrawAmount: BigNumberish],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "INTEREST_RATE"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "batchApplyInterest"
  ): TypedContractMethod<
    [_beginUserID: BigNumberish, _endUserID: BigNumberish],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "depositBankFunds"
  ): TypedContractMethod<[], [void], "payable">;
  getFunction(
    nameOrSignature: "depositFor"
  ): TypedContractMethod<[_user: AddressLike], [void], "payable">;
  getFunction(
    nameOrSignature: "getBankBalance"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getUserBalance"
  ): TypedContractMethod<[_user: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "getUserLength"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "withdraw"
  ): TypedContractMethod<[_withdrawAmount: BigNumberish], [void], "nonpayable">;

  filters: {};
}
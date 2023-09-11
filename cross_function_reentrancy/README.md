# 알게된 사실

# fallback

- solidity 0.4.0 이후로 fallback 함수는 필수가 되었다.

## Declaration

- "Contract에는 `fallback() external [payable]` 또는 `fallback(bytes calldata input) [payable] returns (bytes memory output)`(function 키워드 없이 모두) 등 최대 하나만 있을 수 있습니다. 이 함수는 external visibility를 가져야합니다. fallback 함수는 virtual이거나 override하여 사용하거나, modifier를 가질 수 있습니다."

## Usage

- 호출하려는 함수가 Contract에 있는 어떤 함수와도 일치하지 않으며
- 트랜잭션이 단순히 이더를 전송하려고 하며
- receive 함수가 정의되어 있지 않은 경우 실행된다.
- payable fallback 함수가 receive 함수 대신 사용되는 경우, 최악의 경우 2300 가스만 사용할 수 있다.

# Gas Stipend

- payable fallback 함수가 receive 함수 대신 사용되는 경우, 최악의 경우 2300 가스만 사용할 수 있 습니다.

# Warning

- payable fallback 함수는 receive 함수가 없는 경우 일반 이더 전송에도 실행됩니다. 따라서 payable fallback 함수를 정의하면 항상 receive 함수도 정의하여 이더 전송과 인터페이스 혼란을 구별하는 것이 좋습니다.

# receive

## Declaration

- receive() external payable {...} 형식으로 선언된다.
- 이 함수는 인자를 가질 수 없고, 반환값을 가질 수 없다.
- external visibility와 payable을 가져야한다.

## Usage

- 이 함수는 데이터가 전혀 제공되지 않고 계약에 호출되는 경우 실행된다.
- 이더 전송 시 (ex. send(), transfer()) 실행되는 함수이다.

## Gas Stipend

- 최악의 경우 이 함수는 2300 가스만 사용할 수 있으며, 그로인해 기본 로깅 외에는 다른 작업을 수행할 여지가 거의 없다.

## Fallback Function Alternative

- receive 함수가 없는 경우, payable fallback() 함수가 있을 경우 fallback()가 호출된다.
- Contract는 ETH를 받으려면 receive 함수 또는 fallback 함수가 정의되어 있지 않은 경우 예외가 발생하여 이더를 돌려보냅니다.

> https://docs.soliditylang.org/en/v0.8.21/contracts.html#fallback-function

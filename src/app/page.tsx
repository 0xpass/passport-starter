"use client";
import { useGoogleLogin } from "@react-oauth/google";
import { NewLambda, Passport } from "@0xpass/passport";
import { useState } from "react";
import axios from "axios";
import { createPassportClient } from "@0xpass/passport-viem";
import { mainnet } from "viem/chains";
import { http, WalletClient } from "viem";

export default function Home() {
  const passport = new Passport();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [guess, setGuess] = useState("");

  const [session, setSession] = useState("");

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;

  const alchemyUrl = process.env.NEXT_PUBLIC_ALCHEMY_URL;
  const fallbackProvider = http(alchemyUrl);

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      const token = await getAccessTokenFromCode(codeResponse.code);

      const session = await passport.getSession({
        scope_id: "1",
        verifier_type: "google",
        code: token.toString(),
      });

      console.log(session);

      setSession(JSON.stringify(session.result));
    },
    onError: (errorResponse) => console.log(errorResponse),
  });

  async function getAccessTokenFromCode(code: any): Promise<String> {
    const tokenUrl = "https://oauth2.googleapis.com/token";

    const data = {
      code: code,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      redirect_uri: window.location.origin,
      grant_type: "authorization_code",
    };

    try {
      const response = await axios.post(tokenUrl, data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return response.data.access_token;
    } catch (error) {
      console.error("Error fetching access token");
      throw error;
    }
  }

  async function signMessage() {
    const client: WalletClient = createPassportClient(
      session,
      fallbackProvider,
      mainnet
    );

    client
      .signMessage({
        account: "0x00",
        message: "hello world",
      })
      .then((res) => alert(JSON.stringify(res)))
      .catch((err) => alert(JSON.stringify(err)));
  }

  async function fetchAddress() {
    const client: WalletClient = createPassportClient(
      session,
      fallbackProvider,
      mainnet
    );

    client
      .requestAddresses()
      .then((res) => alert(JSON.stringify(res)))
      .catch((err) => alert(JSON.stringify(err)));
  }

  async function signTx() {
    const client: WalletClient = createPassportClient(
      session,
      fallbackProvider,
      mainnet
    );

    const transaction = await client.prepareTransactionRequest({
      account: "0x4A67aED1aeE7c26b7063987E7dD226f5f5207ED2",
      to: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      value: BigInt(1000000000000000),
      chain: mainnet,
    });

    client
      .signTransaction(transaction)
      .then((res) => alert(JSON.stringify(res)))
      .catch((err) => alert(JSON.stringify(err)));
  }

  const lambdaData: NewLambda = {
    authorization: {
      type: "none",
    },
    max_executions: 1,
    envs: [],
    verifications: {
      count: 1,
    },
    conditions: [
      {
        type: "code",
        code: `return ${guess} == 8;`,
        output_type: "boolean",
        substitution: false,
      },
    ],
    actions: {
      type: "personal_sign",
      check: "",
      data: "0x000000",
      substitution: true,
    },
    postHook: [],
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center">
        <div className="flex flex-col space-y-4 pt-16">
          <button
            className="border border-gray-400 rounded-md p-2 bg-black"
            onClick={googleLogin}
          >
            Login with Google
          </button>

          <input
            type="text"
            className="border border-gray-400 rounded-md p-2 bg-black"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="border border-gray-400 rounded-md p-2 bg-black"
            onClick={async () => {
              const response = await passport.sendOtp({
                scope_id: "1",
                channel_type: "email",
                destination: email,
              });

              console.log(response);
            }}
          >
            Request OTP
          </button>

          <input
            type="text"
            placeholder="OTP"
            className="border border-gray-400 rounded-md p-2 bg-black"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            className="border border-gray-400 rounded-md p-2 bg-black"
            onClick={async () => {
              const response = await passport.getSession({
                scope_id: "1",
                verifier_type: "email",
                code: otp,
              });

              setSession(JSON.stringify(response.result));
            }}
          >
            Submit OTP
          </button>
        </div>

        <div className="flex flex-col space-y-8 items-center mt-10 mb-8">
          <p className="italic">
            You will require a session from one of the above authentication
            methods <br /> before being able to carry out the following
            functionalities.
          </p>

          <button
            className="border border-gray-400 rounded-md p-2 bg-black w-52"
            onClick={fetchAddress}
          >
            Get Address
          </button>
          <button
            className="border border-gray-400 rounded-md p-2 bg-black w-52"
            onClick={signMessage}
          >
            Sign Message
          </button>
          <button
            className="border border-gray-400 rounded-md p-2 bg-black w-52"
            onClick={signTx}
          >
            Sign Transaction
          </button>
        </div>

        <div className="flex flex-col space-y-4 items-center -mt-8 p-8">
          <p>Lambda Guess</p>
          <code className="text-xs -mt-3">
            Guess a number (it's 8), try playing around with it in the code
          </code>
          <input
            type="text"
            className="border border-gray-400 rounded-md p-2 bg-black"
            placeholder="Guess"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
          />
          <button
            className="border border-gray-400 rounded-md p-2 bg-black w-48"
            onClick={async () => {
              const uuid = await passport.lambdaNew({
                data: lambdaData,
                session: JSON.parse(session),
              });

              const signature = await passport.lambdaCall({
                data: {
                  id: uuid.result,
                  params: [],
                },
              });

              alert(JSON.stringify(signature.result));
            }}
          >
            Submit Guess
          </button>
        </div>
      </main>
    </>
  );
}

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type RecordWalletTransactionParams = {
  userId: string;
  asset: string;
  assetType: "fiat" | "crypto";
  amount: number;
  transactionType:
    | "deposit"
    | "withdrawal"
    | "exchange"
    | "fee"
    | "refund"
    | "adjustment";
  reference?: string;
  description?: string;
  status?:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled";
  provider?: string;
  providerReference?: string;
};

export async function recordWalletTransaction({
  userId,
  asset,
  assetType,
  amount,
  transactionType,
  reference,
  description,
  status = "completed",
  provider,
  providerReference,
}: RecordWalletTransactionParams) {
  if (!Number.isFinite(amount) || amount === 0) {
    throw new Error("Invalid wallet transaction amount.");
  }

  const { data: wallet, error: walletError } = await supabaseAdmin
    .from("wallet_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("asset", asset)
    .maybeSingle();

  if (walletError) {
    throw new Error(
      `Unable to read wallet account: ${walletError.message}`
    );
  }

  let currentBalance = 0;

  if (!wallet) {
    const { data: createdWallet, error: createError } =
      await supabaseAdmin
        .from("wallet_accounts")
        .insert({
          user_id: userId,
          asset,
          asset_type: assetType,
          balance: 0,
          available_balance: 0,
          locked_balance: 0,
        })
        .select("*")
        .single();

    if (createError) {
      throw new Error(
        `Unable to create wallet account: ${createError.message}`
      );
    }

    currentBalance = Number(createdWallet.balance);
  } else {
    currentBalance = Number(wallet.balance);
  }

  const newBalance = currentBalance + amount;

  if (newBalance < 0) {
    throw new Error("Wallet balance cannot become negative.");
  }

  const { error: updateError } = await supabaseAdmin
    .from("wallet_accounts")
    .update({
      balance: newBalance,
      available_balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", wallet?.id ?? "");

  if (updateError && wallet) {
    throw new Error(
      `Unable to update wallet account: ${updateError.message}`
    );
  }

  if (!wallet) {
    const { error: newWalletUpdateError } = await supabaseAdmin
      .from("wallet_accounts")
      .update({
        balance: newBalance,
        available_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("asset", asset);

    if (newWalletUpdateError) {
      throw new Error(
        `Unable to initialize wallet balance: ${newWalletUpdateError.message}`
      );
    }
  }

  const { error: transactionError } = await supabaseAdmin
    .from("wallet_transactions")
    .insert({
      user_id: userId,
      transaction_type: transactionType,
      asset,
      asset_type: assetType,
      amount,
      balance_before: currentBalance,
      balance_after: newBalance,
      reference: reference ?? null,
      description: description ?? null,
      status,
      provider: provider ?? null,
      provider_reference: providerReference ?? null,
    });

  if (transactionError) {
    throw new Error(
      `Unable to record wallet transaction: ${transactionError.message}`
    );
  }

  return {
    balanceBefore: currentBalance,
    balanceAfter: newBalance,
  };
}
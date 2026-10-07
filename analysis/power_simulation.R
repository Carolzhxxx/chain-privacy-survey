# Simulation-based power analysis for the main mixed model.
#
# Design (as implemented): each participant rates 6 scenarios (one item from
# each of 6 categories, 18 items in total) x 3 hops (B, C, D knows) = 18 rows.
# Relationship factors are assigned per participant, each balanced over
# stranger / friend / family:
#   A-B, A-C, A-D -> relationship between A and the recipient at hops 1 / 2 / 3
#   B-C           -> path relationship, affects hops 2 and 3
#   C-D           -> path relationship, affects hop 3
#
# Model fitted:
#   acceptability ~ hop + rel_recipient + bc + cd + sensitivity_z + privacy_need_z
#                   + (1 | participant) + (1 | item)
#
# All effect sizes are in scale points (1-7). Replace the assumed values in
# `params` once pilot data are available, then rerun:
#   Rscript analysis/power_simulation.R

suppressMessages(library(lme4))

params <- list(
  intercept = 5.0,          # mean acceptability when B knows (pilot: 5.0)
  hop_c = -2.0,             # C knows vs B knows (pilot: -2.2)
  hop_d = -2.4,             # D knows vs B knows (pilot: -2.5)
  sd_participant = 1.2,     # between-participant SD (pilot means 2.2 vs 4.7)
  sd_item = 0.3,
  sd_residual = 1.3,
  sensitivity = -0.4        # per 1 SD of rated sensitivity
)

effect_sets <- list(
  small = list(rel_friend = 0.3, rel_family = 0.5, bc_known = 0.3, cd_known = 0.3, privacy_need = -0.2),
  medium = list(rel_friend = 0.5, rel_family = 0.8, bc_known = 0.5, cd_known = 0.5, privacy_need = -0.35)
)

levels3 <- c("stranger", "friend", "family")
balanced <- function(n) sample(rep(levels3, length.out = n))

simulate_data <- function(n, eff) {
  p <- data.frame(
    participant = seq_len(n),
    ab = balanced(n), ac = balanced(n), ad = balanced(n),
    bc = balanced(n), cd = balanced(n),
    privacy_need_z = rnorm(n),
    u = rnorm(n, 0, params$sd_participant)
  )
  item_u <- rnorm(18, 0, params$sd_item)
  rows <- expand.grid(participant = seq_len(n), category = 1:6, hop = 1:3)
  rows$item <- (rows$category - 1) * 3 + sample(1:3, nrow(rows), replace = TRUE)
  d <- merge(rows, p, by = "participant")
  d$sensitivity_z <- ave(rnorm(nrow(d)), d$participant, d$category, FUN = function(x) x[1])
  d$rel_recipient <- ifelse(d$hop == 1, d$ab, ifelse(d$hop == 2, d$ac, d$ad))
  rel_effect <- c(stranger = 0, friend = eff$rel_friend, family = eff$rel_family)
  bc_on <- d$hop >= 2 & d$bc != "stranger"
  cd_on <- d$hop == 3 & d$cd != "stranger"
  mu <- params$intercept +
    c(0, params$hop_c, params$hop_d)[d$hop] +
    rel_effect[d$rel_recipient] +
    eff$bc_known * bc_on + eff$cd_known * cd_on +
    params$sensitivity * d$sensitivity_z +
    eff$privacy_need * d$privacy_need_z +
    d$u + item_u[d$item]
  y <- mu + rnorm(nrow(d), 0, params$sd_residual)
  d$acceptability <- pmin(7, pmax(1, round(y)))
  d$hop <- factor(d$hop, labels = c("B", "C", "D"))
  d$rel_recipient <- factor(d$rel_recipient, levels = levels3)
  d$bc_known <- as.numeric(bc_on)
  d$cd_known <- as.numeric(cd_on)
  d
}

terms_of_interest <- c(
  hop_C = "hopC",
  rel_friend = "rel_recipientfriend",
  rel_family = "rel_recipientfamily",
  bc_known = "bc_known",
  cd_known = "cd_known",
  privacy_need = "privacy_need_z"
)

one_run <- function(n, eff) {
  d <- simulate_data(n, eff)
  fit <- suppressMessages(suppressWarnings(lmer(
    acceptability ~ hop + rel_recipient + bc_known + cd_known + sensitivity_z +
      privacy_need_z + (1 | participant) + (1 | item),
    data = d, REML = FALSE
  )))
  z <- coef(summary(fit))[terms_of_interest, "t value"]
  c(abs(z) > 1.96, singular = isSingular(fit))
}

set.seed(20261007)
ns <- as.integer(strsplit(Sys.getenv("POWER_NS", "40,60,100,150,200,300"), ",")[[1]])
reps <- as.integer(Sys.getenv("POWER_REPS", "200"))

results <- list()
for (set_name in names(effect_sets)) {
  for (n in ns) {
    runs <- replicate(reps, one_run(n, effect_sets[[set_name]]))
    power <- rowMeans(runs)
    results[[length(results) + 1]] <- data.frame(effect_size = set_name, n = n, t(round(power, 2)))
    cat(set_name, n, paste(names(power), round(power, 2), sep = "=", collapse = " "), "\n")
  }
}
out <- do.call(rbind, results)
write.csv(out, "analysis/power_results.csv", row.names = FALSE)

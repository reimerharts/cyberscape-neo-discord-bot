package com.titaniumtemplar.discordbot.discord.commands;

import static com.titaniumtemplar.discordbot.model.combat.AttackType.ATTACK;

import com.titaniumtemplar.discordbot.model.combat.AttackType;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor(staticName = "withArgs")
public class AttackCommand extends CombatCommand {

  private final List<String> splitCommand;

  @Override
  protected AttackType getAttackType() {
    return ATTACK;
  }

  @Override
  protected boolean canSpecialize() {
    return false;
  }

  @Override
  protected List<String> getCommand() {
    return splitCommand;
  }
}

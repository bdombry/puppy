/**
 * TextHidden
 * 
 * Remplace <Text> pour cacher le texte si l'utilisateur est gratuit
 * Les blocs, couleurs, emoji restent visibles
 * 
 * Usage:
 *   <TextHidden isPremium={isPremium} style={styles.label}>
 *     Contenu premium
 *   </TextHidden>
 */

import React from 'react';
import { Text } from 'react-native';
import PropTypes from 'prop-types';

const TextHidden = ({ isPremium, children, style, ...props }) => {
  return (
    <Text 
      {...props}
      style={[style, { opacity: isPremium ? 1 : 0 }]}
    >
      {children}
    </Text>
  );
};

TextHidden.propTypes = {
  isPremium: PropTypes.bool.isRequired,
  children: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

TextHidden.defaultProps = {
  children: null,
  style: null,
};

export default TextHidden;

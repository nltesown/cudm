$(document).ready(function() {
  var
    s = "",
    opt = [],
    pattern = [
      /((lu?|me?|je?|ve?|sa?|di?)\s(\d\d?)\s(jan(?:vier)?|fév(?:rier)?|mars?|avr(?:il)?|mai|jui?n|jui?l(?:let)?|août?|sep(?:tembre)?|oct(?:obre)?|nov(?:embre)?|déc(?:embre)?)\s(\d{2}h\d{2})\s(A|B|C)\s?)+/gi,
      /((lu?|me?|je?|ve?|sa?|di?)\s(\d\d?)\s(jan(?:vier)?|fév(?:rier)?|mars?|avr(?:il)?|mai|jui?n|jui?l(?:let)?|août?|sep(?:tembre)?|oct(?:obre)?|nov(?:embre)?|déc(?:embre)?)\s(\d{2}h\d{2})\s(A|B|C))/gi,
      /((?:[^\s]+\/)+[^\s]+)(?:\s(Avec|D\x27après)(\s[^\.]*\.))/gi
    ],
    markItUpOpts = {
      nameSpace: "html",
      onShiftEnter: {
        keepDefault: false,
        replaceWith: '<br>'
      },
      onCtrlEnter: {
        keepDefault: false,
        openWith: '\n<p>',
        closeWith: '</p>\n'
      },
      onTab: {
        keepDefault: false,
        openWith: '     '
      },
      markupSet: [{
          name: 'Heading 1',
          key: '1',
          openWith: '<h1(!( class="[![Class]!]")!)>',
          closeWith: '</h1>',
          placeHolder: 'Titre de niveau 1'
        }, {
          name: 'Heading 2',
          key: '2',
          openWith: '<h2(!( class="[![Class]!]")!)>',
          closeWith: '</h2>',
          placeHolder: 'Titre de niveau 2'
        }, {
          name: 'Heading 3',
          key: '3',
          openWith: '<h3(!( class="[![Class]!]")!)>',
          closeWith: '</h3>',
          placeHolder: 'Titre de niveau 3'
        }, {
          name: 'Paragraph',
          key: 'P',
          openWith: '<p(!( class="[![Class]!]")!)>',
          closeWith: '</p>'
        }, {
          name: 'Blockquote',
          key: 'Q',
          openWith: '<blockquote(!( class="[![Class]!]")!)>',
          closeWith: '</blockquote>'
        }, {
          name: 'Bold',
          key: 'B',
          openWith: '<strong>',
          closeWith: '</strong>'
        }, {
          name: 'Italic',
          key: 'I',
          openWith: '<em>',
          closeWith: '</em>'
        }, {
          name: 'Cite',
          key: 'R',
          openWith: '<cite>',
          closeWith: '</cite>'
        }, {
          name: 'Quotes',
          key: 'G',
          openWith: '« ',
          closeWith: ' »'
        }, {
          name: 'Lowercase',
          key: 'L',
          replaceWith: function(h) {
            return h.selection.toLowerCase();
          }
        }, {
          name: 'Uppercase',
          key: 'U',
          replaceWith: function(h) {
            return h.selection.toUpperCase();
          }
        },
        {
          name: 'Nbsp',
          key: ' ',
          openWith: "&nbsp;"
        }

      ]
    },
    h = $(document).height() - 100,
    w = $(document).width() - 100;

  $("#shoutbox").hide().width(w).height(h).css({
    lineHeight: h + "px"
  });
  $("#input").markItUp(markItUpOpts).focus();
  $("#submit").click(function(e) {
    e.preventDefault();
    $("input[type='checkbox']").each(function() {
      opt[$(this).attr("id")] = !!$(this).attr("checked");
    });

    s = $("#input").val();
    s = s.replace(/&nbsp;/gi, " ");
    s = s.replace(/[\r\n]/g, "\n"); // Normalise la séquence saut de ligne (devient \n)
    s = s.replace(/[\xA0\t]/g, " "); // Remplace tabs et espace insécable par espace [NB : question : y a-t-il des espaces insécables ?]
    s = s.replace(/^\x20+|\x20+$/gm, ""); // Supprime espaces en début et fin de lignes
    s = s.replace(/^\n+|\n+$/g, ""); // Supprime les sauts de lignes et début et fin de document
    s = s.replace(/(\n){3,}/g, "\n\n"); // Remplace 3+ sauts de ligne par 2 sauts de ligne
    s = s.replace(/(\x20){2,}/g, " "); // Remplace 2+ espaces par 1 espace
    s = s.replace(/(\x20)([,\.])/g, "$2"); // Enlève espace devant virgule ou point [080212]
    s = s.replace(/Av\x20ec/g, "Avec"); // Correction d'un problème fréquent du PDF programme [080212]
    s = s.replace(/…/g, "...");
    s = s.replace(/[’‘]/g, "'");
    s = s.replace(/[“”]/g, "\"");
    s = s.replace(/\xAC/g, ""); // 2012-09-19 Supprime le caractère ¬ (logical not - utilisé par Word comme césure optionnelle)
    //s = s.replace(/[\uFF00-\uFFEF]/g, ""); // 2012-09-25 Supprime les caractères de la plage Unicode Halfwidth and Fullwidth Forms
    s = s.replace(/(\s)(-)(\s)/g, "$1–$3"); // 2013-05-10 Remplace un tiret par un demi-cadratin lorsqu'il est entouré d'espaces


    if (opt.oelig) { // Remplace OE/oe par Œ/œ
      s = s.replace(/\O[Ee]/g, "Œ");
      s = s.replace(/oe/g, "œ");
    }

    if (!opt.frenchquotes) { // Remplace les guillemets français par des guillemets droits
      s = s.replace(/\xAB\x20/g, "\"");
      s = s.replace(/\x20\xBB/g, "\"");
      s = s.replace(/\xAB/g, "\"");
      s = s.replace(/\xBB/g, "\"");
    } else {
      s = s.replace(/\xAB\x20*/g, "« ");
      s = s.replace(/\x20*\xBB/g, " »");
    }


    if (opt.forceFrenchQuotes) {
      s = s.replace(/\"([^"]*)\"/g, "« $1 »");
    }


    if (opt.nbsp) {
      s = s.replace(/(\x20)([\?:!;\xBB])/gi, "&nbsp;$2"); // Espaces insécables HTML
      s = s.replace(/(\xAB)(\x20)/gi, "$1&nbsp;");
    }

    if (opt.normalizeBlankLines) {
      s = s.replace(/([^\n])(\n{3,})([^\n])/gi, "$1\n$3");
    }


    if (opt.pdf_lines) {
      s = s.replace(/([^\n])(\n)([^\n])/gi, "$1 $3");
    }

    if (opt.films) {
      s = s.replace(pattern[0], function(m) {
        return "\n" + m.replace(pattern[1], "$1\n") + "\n";
      });
      s = s.replace(pattern[2], "$1\n$2$3\n");
    }

    s = s.replace(/(<p>){2,}/, "<p>");
    s = s.replace(/(<\/p>){2,}/, "</p>");
    s = s.replace(/(<p><\/p>)+/gi, "");
    s = s.replace(/(<\/h1>|<\/h2>|<\/p>|<\/blockquote>|<\/cite>)(\x20*)(<h1>|<h2>|<p>|<blockquote>|<cite>)/gi, "$1\n$3"); // Saut de ligne entre éléments blocs
    s = s.replace(/(\x20){2,}/g, " "); // Remplace 2+ espaces par 1 espace (2ème passe)

    if (opt.nospace) {
      s = s.replace(/\s/g, ""); // Supprime tous les espaces
    }

    $("#input").val(s);

  });

  $("#input").countChar();

});


/**
 * jQuery.countChar
 * Date: 2012-02-14
 * Requires : jQuery
 * @author Nicolas Le Thierry d'Ennequin
 * @version 1.0
 * Counts the characters in a textarea (NB : element type not controlled)
 * Triggered by the focus and keyup events on the textarea + the related submit button
 */
(function($) {
  $.fn.countChar = function() {
    return this.each(function() {
      var textarea = this,
        label = $("<label class=\"bcount\"><span>0</span> car.</label>").insertBefore(this).find("span");

      $(this).parents("form").find("input[type='submit']").on("click", function(e) {
        count(e, textarea);
      });

      $(textarea).on("focus keyup", function(e) {
        count(e, textarea);
        $("#output").html($("#input").val());
      });

      function count(e, textarea) {
        e.preventDefault();
        label.text(textarea.value.replace(/\n/g, "").length);
      }
    });
  };
}(jQuery));